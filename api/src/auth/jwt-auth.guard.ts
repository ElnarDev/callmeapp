import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Reutilizable: cualquier controlador que decore un endpoint con @UseGuards(JwtAuthGuard)
// exigirá un Bearer token válido en el header Authorization.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
