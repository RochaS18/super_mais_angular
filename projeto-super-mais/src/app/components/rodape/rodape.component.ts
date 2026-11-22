import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Beneficio {
  classeIcone: string;
  icone: string;
  titulo: string;
  texto: string;
}

@Component({
  selector: 'app-rodape',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './rodape.component.html',
  styleUrl: './rodape.component.css',
})
export class RodapeComponent {
  beneficios: Beneficio[] = [
    { classeIcone: 'truck-icon',    icone: '/original/higiene/icone/entrega_icone.png',            titulo: 'Entrega rápida',      texto: 'Receba seus produtos com agilidade' },
    { classeIcone: 'security-icon', icone: '/original/higiene/icone/pagamento_seguro_icone.png',   titulo: 'Pagamento seguro',    texto: 'Seus dados protegidos em todas as compras' },
    { classeIcone: 'gift-icon',     icone: '/original/higiene/icone/variedade_icone.png',          titulo: 'Variedade garantida', texto: 'Produtos de higiene para toda a família' },
    { classeIcone: 'support-icon',  icone: '/original/higiene/icone/atendimento_humano_icone.png', titulo: 'Atendimento humano',  texto: 'Conte com a nossa equipe quando precisar' },
  ];
}
