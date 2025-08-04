import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService extends SupabaseClient {
    constructor(private readonly config: ConfigService) {
        super(
            config.get('SUPABASE_URL') as string,
            config.get('SUPABASE_SERVICE_ROLE_KEY') as string,
        );
    }
}
