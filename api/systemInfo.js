const si = require('systeminformation');
const crypto = require('crypto');
const fs = require('fs');
const { execSync } = require('child_process');

// function getBIOSTime() {
//     try {
//         const output = execSync('wmic bios get releasedate /value').toString();
//         const match = output.match(/ReleaseDate=(\d{14})/);
//         if (match) {
//             const biosDate = match[1];
//             return new Date(
//             biosDate.substring(0, 4),
//             biosDate.substring(4, 6) - 1,
//             biosDate.substring(6, 8),
//             biosDate.substring(8, 10),
//             biosDate.substring(10, 12),
//             biosDate.substring(12, 14)
//             );
//         }
//     } catch (error) {
//       console.error('Could not read BIOS time:', error.message);
//       return null;
//     }
//   }

// function getRTCtime() {
//   try {
//       const output = execSync('wmic path win32_operatingsystem get lastbootuptime').toString();
//       const match = output.match(/\d{14}/);
//       if (match) {
//         const winTime = match[0];
//         return new Date(
//           winTime.substring(0, 4),
//           winTime.substring(4, 2) - 1,
//           winTime.substring(6, 2),
//           winTime.substring(8, 2),
//           winTime.substring(10, 2),
//           winTime.substring(12, 2)
//         );
//       }
//     throw new Error('Unsupported platform or no RTC found');
//   } catch (error) {
//     console.error('RTC read error:', error.message);
//     return null;
//   }
// }
//   console.log('RTC', getRTCtime());
//   console.log('BIOS', getBIOSTime());

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

fs.writeFileSync('private.pem', privateKey);
fs.writeFileSync('public.pem', publicKey);

async function getDetailedSystemInfo() {
  return {
    baseboard: await si.baseboard(),
    bios: await si.bios(),
    cpu: await si.cpu(),
    mem: await si.mem(),
    diskLayout: await si.diskLayout(),
    uuid: await si.uuid(),
    osInfo: await si.osInfo()
  };
}

function createHardwareFingerprint(systemInfo) {
  const fingerprintData = [
    systemInfo.uuid.os,
    systemInfo.diskLayout[0]?.serialNum || 'NO_DISK',
    systemInfo.cpu.manufacturer + systemInfo.cpu.model,
    systemInfo.baseboard.serial
  ].join('|');

  return crypto.createHash('sha256').update(fingerprintData).digest('hex');
}

function signData(data, privateKey) {
  const signer = crypto.createSign('SHA256');
  signer.update(JSON.stringify(data));
  signer.end();
  return signer.sign(privateKey, 'base64');
}

(async () => {
  try {
    const systemInfo = await getDetailedSystemInfo();    
    const fingerprint = createHardwareFingerprint(systemInfo);
    
    const licenseData = {
      hardwareId: fingerprint,
      timestamp: new Date().toISOString(),
      systemSummary: {
        cpu: systemInfo.cpu.manufacturer,
        memory: systemInfo.mem.total,
        disks: systemInfo.diskLayout.length
      }
    };
    
    const signature = signData(licenseData, privateKey);
    const license = {
      ...licenseData,
      signature: signature,
    };
    
    console.log('Generated License:');
    console.log(license);
    
    const verifier = crypto.createVerify('SHA256');
    verifier.update(JSON.stringify(licenseData));
    const isVerified = verifier.verify(publicKey, license.signature, 'base64');
    
    console.log('\nSignature Verified:', isVerified);
    
  } catch (error) {
    console.error('Error:', error);
  }
})();