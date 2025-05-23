// export interface Role {
//     name: string;
//     description: string;
//     permissions: string[];
// }
 
 
export interface Role {
    name: string;
    description: string;
    permissions: { [page: string]: string[] }; // ACL-style
  }
 
 