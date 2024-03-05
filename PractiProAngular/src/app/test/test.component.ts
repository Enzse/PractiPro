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
  rng: number = 0;
  pokemonAppeared: boolean = false;
  teamVisible: boolean = false;

  addtrainerVisible: boolean = false;
  addTrainerId: number = 0;
  addTrainerName: string = "";
  addTrainerGender: string = "";

  team = [
    { id: 1, name: "Chikorita", type1: "Grass", type2: null },
    { id: 2, name: "Gyarados", type1: "Water", type2: "Flying" },
    { id: 3, name: "Glaceon", type1: "Ice", type2: null },
  ]
  alltrainers = [
    { id: 1, name: "Shawn", gender: "male" },
    { id: 2, name: "Dominic", gender: "male" }
  ]

  showTeam() {
    this.teamVisible = !this.teamVisible;
  }
  showAddTrainer() {
    this.addtrainerVisible = !this.addtrainerVisible;
  }

  addTrainer() {
    let trainer = {
      id: this.addTrainerId,
      name: this.addTrainerName,
      gender: this.addTrainerGender
    }
    this.alltrainers.push(trainer);
  }

  deleteTrainer(){
    this.alltrainers.pop();
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
