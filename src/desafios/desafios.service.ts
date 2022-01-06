import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Desafio, Partida } from './interfaces/desafio.interface';
import { Model } from 'mongoose';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
import { AtribuirDesafioPartidaDto } from './dtos/atribuir-desafio-partida.dto';
import { DesafioStatus } from './interfaces/desafio-status.enum';
import { CategoriasService } from 'src/categorias/categorias.service';


@Injectable()
export class DesafiosService {

    constructor(
        @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
        @InjectModel('Partida') private readonly partidaModel: Model<Partida>,
        private readonly jogadoresService: JogadoresService,
        private readonly categoriasService: CategoriasService) { }

    async criarDesafio(criarDesafioDto: CriarDesafioDto): Promise<Desafio> {

        // Verifica se os jogadores estão cadastrados

        const jogadores = await this.jogadoresService.consultarTodosJogadores()

        criarDesafioDto.jogadores.map(jogadorDto => {
            const jogadorFilter = jogadores.filter(jogador => jogador._id == jogadorDto._id)

            if (jogadorFilter.length == 0) {
                throw new BadRequestException(`O id ${JSON.stringify(jogadorDto._id)} não é um jogador`)
            }

        })

        // Verifica se o solicitante é um dos jogadores da partida

        const solicitanteEhJogadorDaPartida = criarDesafioDto.jogadores.filter(jogador => jogador._id == criarDesafioDto.solicitante._id)


        if (solicitanteEhJogadorDaPartida.length == 0) {
            throw new BadRequestException(`O solicitante deve ser um jogador da partida`)

        }

        // Descobrir a categoria com base no Id do jogador solicitante

        const categoriaDoJogador = await this.categoriasService.consultarCategoriaDoJogador(criarDesafioDto.solicitante)

        if (!categoriaDoJogador) {
            throw new BadRequestException(`O solicitante deve estar registrado em uma categoria`)
        }

        const desafioCriado = new this.desafioModel(criarDesafioDto)
        desafioCriado.categoria = categoriaDoJogador.categoria
        desafioCriado.dataHoraSolicitacao = new Date()
        desafioCriado.status = DesafioStatus.PENDENTE

        return await desafioCriado.save()

    }

    async consultarTodosDesafios(): Promise <Desafio[]>{
        return await this.desafioModel.find()
        .populate('solicitante')
        .populate('jogadores')
        // .populate('partida')
        .exec()
    }
        
    async consultarDesafiosDeUmJogador(_id: any): Promise <Desafio[]>{

        const jogadores = await this.jogadoresService.consultarTodosJogadores()

        const jogadorFilter = jogadores.filter( jogador => jogador._id == _id )

        if(jogadorFilter.length == 0){
            throw new BadRequestException(`O id ${_id} não é um jogador`)
        }

        return await this.desafioModel.find()
        .where('jogadores')
        .in(_id)
        .populate('solicitante')
        .populate('jogadores')
        // .populate('partida')
        .exec()
    }

    async atualizarDesafio(_id: string, atualizarDesafioDto: AtualizarDesafioDto): Promise<void> {
   
        const desafioEncontrado = await this.desafioModel.findById(_id).exec()

        if (!desafioEncontrado) {
            throw new NotFoundException(`Desafio ${_id} não cadastrado!`)
        }

        /*
        Atualizaremos a data da resposta quando o status do desafio vier preenchido 
        */
        if (atualizarDesafioDto.status){
           desafioEncontrado.dataHoraResposta = new Date()         
        }
        desafioEncontrado.status = atualizarDesafioDto.status
        desafioEncontrado.dataHoraDesafio = atualizarDesafioDto.dataHoraDesafio

        await this.desafioModel.findOneAndUpdate({_id},{$set: desafioEncontrado}).exec()
        
    }


    async atribuirDesafioPartida(_id: string, atribuirDesafioPartidaDto: AtribuirDesafioPartidaDto ): Promise<void> {

        const desafioEncontrado = await this.desafioModel.findById(_id).exec()
        
        if (!desafioEncontrado) {
            throw new BadRequestException(`Desafio ${_id} não cadastrado!`)
        }

         /*
        Verificar se o jogador vencedor faz parte do desafio
        */
       const jogadorFilter = desafioEncontrado.jogadores.filter( jogador => jogador._id == atribuirDesafioPartidaDto.def._id )


       if (jogadorFilter.length == 0) {
           throw new BadRequestException(`O jogador vencedor não faz parte do desafio!`)
       }

        /*
        Primeiro vamos criar e persistir o objeto partida
        */
       const partidaCriada = new this.partidaModel(atribuirDesafioPartidaDto)

       /*
       Atribuir ao objeto partida a categoria recuperada no desafio
       */
       partidaCriada.categoria = desafioEncontrado.categoria

       /*
       Atribuir ao objeto partida os jogadores que fizeram parte do desafio
       */
       partidaCriada.jogadores = desafioEncontrado.jogadores

       const resultado = await partidaCriada.save()
       
        /*
        Quando uma partida for registrada por um usuário, mudaremos o 
        status do desafio para realizado
        */
        desafioEncontrado.status = DesafioStatus.REALIZADO

        /*  
        Recuperamos o ID da partida e atribuimos ao desafio
        */
        desafioEncontrado.partida = resultado._id

        try {
        await this.desafioModel.findOneAndUpdate({_id},{$set: desafioEncontrado}).exec() 
        } catch (error) {
            /*
            Se a atualização do desafio falhar excluímos a partida 
            gravada anteriormente
            */
           await this.partidaModel.deleteOne({_id: resultado._id}).exec();
           throw new InternalServerErrorException()
        }
    }



    async deletarDesafio(_id: string): Promise<void> {

        const desafioEncontrado = await this.desafioModel.findById(_id).exec()

        if (!desafioEncontrado) {
            throw new BadRequestException(`Desafio ${_id} não cadastrado!`)
        }
        
        /*
        Realizaremos a deleção lógica do desafio, modificando seu status para
        CANCELADO
        */
       desafioEncontrado.status = DesafioStatus.CANCELADO

       await this.desafioModel.findOneAndUpdate({_id},{$set: desafioEncontrado}).exec() 

    }

}
