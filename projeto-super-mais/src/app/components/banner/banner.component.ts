import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
})
export class BannerComponent {
  @Input({ required: true }) titulo!: string;
  @Input({ required: true }) descricao!: string;
  @Input({ required: true }) imagemFundo!: string;
  @Input() corTitulo = '#16222B';
  @Input() estiloCategoria = false;
  @Input() textoBotao = 'Ver ofertas';
  @Input() rotaBotao = '/ofertas';
}
