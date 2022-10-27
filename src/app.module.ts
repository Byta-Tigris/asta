import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProtocolController } from './server/protocol/protocol.controller';
import { ProtocolModule } from './server/protocol/protocol.module';

@Module({
    imports: [ProtocolModule],
    controllers: [AppController, ProtocolController],
    providers: [AppService]
})
export class AppModule {}
