import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JogadoresModule } from './jogadores/jogadores.module';
import { CategoriasModule } from './categorias/categorias.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://nestcourse:nestcourse123@cluster0.glt1h.mongodb.net/smartranking?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopoLogy: true}),    
    JogadoresModule, CategoriasModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
