export interface paths {
    "/api/v1/menu/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Carte complète (plats disponibles) */
        get: operations["api_v1_menu_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/menu/dishes/{slug}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Fiche d'un plat avec ses options */
        get: operations["api_v1_menu_dishes_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/menu/featured/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Plats mis en avant sur l'accueil */
        get: operations["api_v1_menu_featured_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/settings/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Coordonnées et horaires du restaurant
         * @description Coordonnées et horaires pour le pied de page et la page Nous trouver.
         */
        get: operations["api_v1_settings_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Category: {
            readonly id: number;
            slug?: string;
            /** Nom */
            name: string;
            /**
             * Icône
             * @description Emoji ou nom d'icône utilisé par le site.
             */
            icon?: string;
            readonly subcategories: components["schemas"]["SubCategory"][];
        };
        Dish: {
            readonly id: number;
            slug?: string;
            /** Nom */
            name: string;
            description?: string;
            /** Prix (FCFA) */
            price: number;
            /** Format: uri */
            photo?: string;
            /**
             * Mis en avant
             * @description Affiché sur la page d'accueil.
             */
            is_featured?: boolean;
            /** Temps de préparation (min) */
            prep_minutes?: number;
            readonly option_groups: components["schemas"]["OptionGroup"][];
        };
        /** @description Fiche d'un plat ou plat mis en avant : on y ajoute où il se trouve dans la carte. */
        DishDetail: {
            readonly id: number;
            slug?: string;
            /** Nom */
            name: string;
            description?: string;
            /** Prix (FCFA) */
            price: number;
            /** Format: uri */
            photo?: string;
            /**
             * Mis en avant
             * @description Affiché sur la page d'accueil.
             */
            is_featured?: boolean;
            /** Temps de préparation (min) */
            prep_minutes?: number;
            readonly option_groups: components["schemas"]["OptionGroup"][];
            readonly subcategory: string;
            readonly category: string;
        };
        Option: {
            readonly id: number;
            /**
             * Nom
             * @description Ex. Foutou, Attiéké.
             */
            name: string;
            /** Supplément (FCFA) */
            price_delta?: number;
            /** Choisi par défaut */
            is_default?: boolean;
        };
        OptionGroup: {
            readonly id: number;
            /**
             * Nom
             * @description Ex. Accompagnement, Piment.
             */
            name: string;
            /**
             * Choix minimum
             * @description 0 = facultatif.
             */
            min_choices?: number;
            /** Choix maximum */
            max_choices?: number;
            readonly options: components["schemas"]["Option"][];
        };
        PublicSettings: {
            /** Nom */
            name?: string;
            /** Téléphone */
            phone?: string;
            whatsapp?: string;
            /**
             * E-mail
             * Format: email
             */
            email?: string;
            /** Adresse */
            address?: string;
            /**
             * Lien Google Maps
             * Format: uri
             */
            maps_url?: string;
            /**
             * Horaires d'ouverture
             * @description Ex. {"lun": [["11:00", "15:00"], ["18:00", "23:00"]]}. Jour absent ou liste vide = fermé.
             */
            opening_hours?: unknown;
            /** Durée d'un créneau (min) */
            reservation_slot_minutes?: number;
            /**
             * Taille maximale d'un groupe
             * @description Au-delà, le client est renvoyé vers le traiteur.
             */
            reservation_max_party?: number;
        };
        SubCategory: {
            readonly id: number;
            slug?: string;
            /** Nom */
            name: string;
            /** Format: uri */
            photo?: string;
            readonly dishes: components["schemas"]["Dish"][];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    api_v1_menu_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Category"][];
                };
            };
        };
    };
    api_v1_menu_dishes_retrieve: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DishDetail"];
                };
            };
        };
    };
    api_v1_menu_featured_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DishDetail"][];
                };
            };
        };
    };
    api_v1_settings_retrieve: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicSettings"];
                };
            };
        };
    };
}
