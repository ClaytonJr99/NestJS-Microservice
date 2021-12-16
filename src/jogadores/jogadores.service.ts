import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CriarJogadorDto } from "./dtos/criar-jogador.dto";
import { Jogador } from "./interfaces/jogador.interface"; 
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class JogadoresService{

    private jogadores: Jogador[] =[];

    private readonly logger = new Logger(JogadoresService.name);

    async criarAtualizarJogador(criajogadorDto: CriarJogadorDto): Promise<void>{

        const { email } = criajogadorDto;

        const jogadorEncontrado = this.jogadores.find(jogador => jogador.email == email);

        if(jogadorEncontrado){
            this.atualizar(jogadorEncontrado, criajogadorDto);
        } else{
            this.criar(criajogadorDto)
        }

    }

    async consultarTodosJogadores(): Promise <Jogador[]>{
        return this.jogadores;
    }

    async consultarJogadorePeloEmail(email: string): Promise <Jogador>{
        const jogadorEncontrado = this.jogadores.find(jogador => jogador.email == email);
        if(!jogadorEncontrado){
            throw new NotFoundException(`Jogador com email: ${email} não encontrado`);
        }

        return jogadorEncontrado;
    }

    async deletarJogador(email): Promise <void>{

        const jogadorEncontrado = this.jogadores.find(jogador => jogador.email == email);
        this.jogadores = this.jogadores.filter(jogador => jogador.email != jogadorEncontrado.email);

    }

    private criar(criaJogadorDto: CriarJogadorDto): void {
        const { nome, telefoneCelular, email } = criaJogadorDto
        const jogador: Jogador = {
            _id: uuidv4(),
            nome,
            telefoneCelular,
            email,
            ranking: 'A',
            posicaoRanking: 1,
            urlFotoJogador: 'www.google.com.br/foto123.jpg'
        }
        this.logger.log(`criaJogadorDto: ${JSON.stringify(jogador)}`)
        this.jogadores.push(jogador);

    }

    private atualizar(jogadorEncontrado: Jogador, criarJogadorDto: CriarJogadorDto): void{
        const { nome } = criarJogadorDto

        jogadorEncontrado.nome = nome;

    }

}