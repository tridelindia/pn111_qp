import { Component, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'qatar_new';
  ngOnInit(): void {
      
  const theme = localStorage.getItem('theme');
// chartFont = theme!;
//   this.theme = theme!;
  this.onChangeTheme(theme!);
} 
constructor(private renderer: Renderer2){}
 onChangeTheme(theme:string){
    this.renderer.setAttribute(document.documentElement, 'data-theme', theme);
    localStorage.setItem('theme', theme);
   const data = window.dispatchEvent(new Event('storage'));
  }
}
