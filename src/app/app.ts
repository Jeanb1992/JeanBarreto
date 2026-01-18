import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component'; // Importa HeaderComponent

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent], // Agrega HeaderComponent a los imports
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('devsu-test');
}
