
import { Component } from '@angular/core';

@Component({
  selector: 'app-contato-pagina-contato',
  standalone: true,
  imports: [],
  templateUrl: './contato-pagina-contato.component.html',
  styleUrl: './contato-pagina-contato.component.css'
})
export class ContatoPaginaContatoComponent {

  mensagemEnviada = false;

  enviarMensagem(evento: Event, formulario: HTMLFormElement): void {
    evento.preventDefault();

    formulario.reset();

    this.mensagemEnviada = true;
  }

}
