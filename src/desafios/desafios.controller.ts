import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { DesafiosService } from './desafios.service';
import { AtribuirDesafioPartidaDto } from './dtos/atribuir-desafio-partida.dto';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { Desafio } from './interfaces/desafio.interface';
import { DesafioStatusValidacaoPipe } from './pipes/desafio-status-validation.pipe';

@Controller('api/v1/desafios')
export class DesafiosController {

    constructor (private readonly desafiosService: DesafiosService) {}
    
    private readonly looger = new Logger(DesafiosController.name)

    @Post()
    @UsePipes(ValidationPipe)
    async criarDesafio(@Body()criarDesafioDto: CriarDesafioDto){
        this.looger.log(`criarDesafioDto: ${JSON.stringify(criarDesafioDto)}`)
        return await this.desafiosService.criarDesafio(criarDesafioDto)

    }

    @Get()
    async consultarDesafios(
        @Query('idJogador') _id: string): Promise <Desafio[]>{
        return _id ? await this.desafiosService.consultarDesafiosDeUmJogador(_id)
        : await this.desafiosService.consultarTodosDesafios();
    }


    @Put('/:desafio')
    async atualizarDesafio(
        @Body(DesafioStatusValidacaoPipe) atualizarDesafioDto: AtualizarDesafioDto,
        @Param('desafio') _id: string): Promise<void> {
            await this.desafiosService.atualizarDesafio(_id, atualizarDesafioDto)

        } 

    @Post('/:desafio/partida')
    async atribuirDesafioPartida(
        @Body(ValidationPipe) atribuirdesafioPartidaDto: AtribuirDesafioPartidaDto,
        @Param('desafio') _id: string): Promise <void>{
        return await this.desafiosService.atribuirDesafioPartida(_id, atribuirdesafioPartidaDto)

    }

    @Delete('/:_id')
    async deletarDesafio(
        @Param('_id') _id: string): Promise<void> {
            await this.desafiosService.deletarDesafio(_id)
     }

}
