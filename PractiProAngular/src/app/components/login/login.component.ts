import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.getPokemon();
  }

  getPokemon() {
    this.dataService.sendRequest('pokemon/chikorita').subscribe((result: any) => {
      console.log(result);
    })
  }
}
