import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent {
  trainerName: string = "Denzel";
  pokemon: string = "Slowpoke";
  encounter: string = `Wild ${this.pokemon} appeared!`;
  pokemonAppeared: boolean = false;
  teamVisible: boolean = false;
  rng: number = 0;
  team = [
    { id: 1, name: "Chikorita", type1: "Grass", type2: null },
    { id: 2, name: "Gyarados", type1: "Water", type2: "Flying" },
    { id: 3, name: "Glaceon", type1: "Ice", type2: null },
  ]

  showTeam() {
    this.teamVisible = !this.teamVisible;
  }


  walkAround() {
    this.rng = Math.floor(Math.random() * 2);
    if (this.rng == 1) {
      this.pokemonAppeared = true;
    }
    else {
      this.pokemonAppeared = false;
    }
  }

  catchPokemon() {
    this.encounter = `${this.pokemon} has been captured!`;
  }


}
