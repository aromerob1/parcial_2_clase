import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlbumEntity } from '../album/album.entity/album.entity';
import { PerformerEntity } from '../performer/performer.entity/performer.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';

@Injectable()
export class PerformerAlbumService {
    constructor(
        @InjectRepository(PerformerEntity)
        private readonly performerRepository: Repository<PerformerEntity>,
    
        @InjectRepository(AlbumEntity)
        private readonly albumRepository: Repository<AlbumEntity>
    ) {}

    async addPerformerToAlbum(albumId: string, performerId: string): Promise<AlbumEntity> {
        const performer: PerformerEntity = await this.performerRepository.findOne({where: {id: performerId}});
        if (!performer)
          throw new BusinessLogicException("The performer with the given id was not found", BusinessError.NOT_FOUND);
      
        const album: AlbumEntity = await this.albumRepository.findOne({where: {id: albumId}, relations: ["tracks", "performers"]});
        if (!album)
          throw new BusinessLogicException("The album with the given id was not found", BusinessError.NOT_FOUND);
        
        if (album.performers.length >= 3)
            throw new BusinessLogicException("The album already has 3 performers", BusinessError.BAD_REQUEST);
        
        album.performers = [...album.performers, performer];
        return await this.albumRepository.save(album);
      }
}
