export interface paths {
    "/api/v1/catering/formulas/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Formules traiteur */
        get: operations["api_v1_catering_formulas_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/catering/quotes/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Demande de devis traiteur */
        post: operations["api_v1_catering_quotes_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/quotes/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["api_v1_manage_quotes_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/quotes/{id}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["api_v1_manage_quotes_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Changer le statut ou la note interne */
        patch: operations["api_v1_manage_quotes_partial_update"];
        trace?: never;
    };
    "/api/v1/manage/reservations/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["api_v1_manage_reservations_list"];
        put?: never;
        /** Saisie d'une réservation prise au téléphone ou sur place (confirmée) */
        post: operations["api_v1_manage_reservations_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/reservations/{id}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["api_v1_manage_reservations_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/reservations/{id}/cancel/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["api_v1_manage_reservations_cancel_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/reservations/{id}/complete/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["api_v1_manage_reservations_complete_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/reservations/{id}/confirm/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["api_v1_manage_reservations_confirm_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/reservations/{id}/no-show/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["api_v1_manage_reservations_no_show_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/reservations/{id}/refuse/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["api_v1_manage_reservations_refuse_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
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
    "/api/v1/reservations/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Demande de réservation (statut pending) */
        post: operations["api_v1_reservations_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reservations/availability/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Créneaux d'un jour pour un nombre de personnes
         * @description Throttle anon par défaut (60/min, IP via core.throttling), pas de cache.
         */
        get: operations["api_v1_reservations_availability_retrieve"];
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
        ActionResult: {
            reservation: components["schemas"]["ReservationStaff"];
            /** Format: uri */
            whatsapp_url: string | null;
        };
        Availability: {
            /** Format: date */
            date: string;
            party: number;
            closed: boolean;
            max_party: number;
            slots: components["schemas"]["Slot"][];
        };
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
        Confirm: {
            table_id?: number | null;
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
        /**
         * @description * `mariage` - Mariage
         *     * `anniversaire` - Anniversaire
         *     * `bapteme` - Baptême
         *     * `cocktail` - Cocktail
         *     * `seminaire` - Séminaire
         *     * `buffet` - Buffet
         *     * `soiree_dinatoire` - Soirée dînatoire
         *     * `diner_gala` - Dîner de gala
         * @enum {string}
         */
        EventTypeEnum: "mariage" | "anniversaire" | "bapteme" | "cocktail" | "seminaire" | "buffet" | "soiree_dinatoire" | "diner_gala";
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
        PaginatedQuoteStaffList: {
            /** @example 123 */
            count: number;
            /**
             * Format: uri
             * @example http://api.example.org/accounts/?page=4
             */
            next?: string | null;
            /**
             * Format: uri
             * @example http://api.example.org/accounts/?page=2
             */
            previous?: string | null;
            results: components["schemas"]["QuoteStaff"][];
        };
        PaginatedReservationStaffList: {
            /** @example 123 */
            count: number;
            /**
             * Format: uri
             * @example http://api.example.org/accounts/?page=4
             */
            next?: string | null;
            /**
             * Format: uri
             * @example http://api.example.org/accounts/?page=2
             */
            previous?: string | null;
            results: components["schemas"]["ReservationStaff"][];
        };
        PatchedQuoteStaff: {
            readonly id?: number;
            /** Référence */
            readonly reference?: string;
            /** Type d'événement */
            readonly event_type?: components["schemas"]["EventTypeEnum"];
            readonly event_type_display?: string;
            /**
             * Date de l'événement
             * Format: date
             */
            readonly event_date?: string;
            /** Invités */
            readonly guests?: number;
            /** Lieu */
            readonly place_type?: components["schemas"]["PlaceTypeEnum"];
            readonly place_type_display?: string;
            /** Commune ou salle */
            readonly place_detail?: string;
            /**
             * Formule
             * @description Vide = indécis.
             */
            readonly formula?: number | null;
            /** @default Indécis */
            readonly formula_name: string;
            /** Nom */
            readonly name?: string;
            /** @description Format +225XXXXXXXXXX. */
            readonly whatsapp?: string;
            /**
             * E-mail
             * Format: email
             */
            readonly email?: string;
            readonly message?: string;
            /** Statut */
            status?: components["schemas"]["QuoteStatusEnum"];
            readonly status_display?: string;
            /**
             * Note interne
             * @description Visible du personnel seulement.
             */
            internal_note?: string;
            /**
             * Créé le
             * Format: date-time
             */
            readonly created_at?: string;
            /**
             * Modifié le
             * Format: date-time
             */
            readonly updated_at?: string;
        };
        /**
         * @description * `restaurant` - Au restaurant
         *     * `domicile` - À domicile
         *     * `autre` - Autre lieu
         * @enum {string}
         */
        PlaceTypeEnum: "restaurant" | "domicile" | "autre";
        PublicFormula: {
            slug?: string;
            /** Nom */
            name: string;
            description?: string;
            /**
             * À partir de (FCFA / personne)
             * @description Vide = « sur devis ».
             */
            price_from?: number | null;
            readonly items: string[];
            /** Mise en avant */
            is_highlighted?: boolean;
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
             * @description Plages d'ouverture par jour. Jour absent ou liste vide = fermé.
             * @example {
             *       "lun": [
             *         [
             *           "11:00",
             *           "15:00"
             *         ],
             *         [
             *           "18:00",
             *           "23:00"
             *         ]
             *       ],
             *       "dim": []
             *     }
             */
            readonly opening_hours: {
                lun?: string[][];
                mar?: string[][];
                mer?: string[][];
                jeu?: string[][];
                ven?: string[][];
                sam?: string[][];
                dim?: string[][];
            };
            /** Durée d'un créneau (min) */
            reservation_slot_minutes?: number;
            /**
             * Taille maximale d'un groupe
             * @description Au-delà, le client est renvoyé vers le traiteur.
             */
            reservation_max_party?: number;
            /** Nombre minimum d'invités pour un devis */
            catering_min_guests?: number;
        };
        QuoteCreate: {
            event_type: components["schemas"]["EventTypeEnum"];
            /** Format: date */
            event_date: string;
            guests: number;
            place_type: components["schemas"]["PlaceTypeEnum"];
            /** @default  */
            place_detail: string;
            /** @description Slug d'une formule, ou « indecis ». */
            formula: string;
            name: string;
            whatsapp: string;
            /**
             * Format: email
             * @default
             */
            email: string;
            /** @default  */
            message: string;
        };
        QuoteCreated: {
            reference: string;
            /** Format: uri */
            whatsapp_url: string | null;
        };
        QuoteStaff: {
            readonly id: number;
            /** Référence */
            readonly reference: string;
            /** Type d'événement */
            readonly event_type: components["schemas"]["EventTypeEnum"];
            readonly event_type_display: string;
            /**
             * Date de l'événement
             * Format: date
             */
            readonly event_date: string;
            /** Invités */
            readonly guests: number;
            /** Lieu */
            readonly place_type: components["schemas"]["PlaceTypeEnum"];
            readonly place_type_display: string;
            /** Commune ou salle */
            readonly place_detail: string;
            /**
             * Formule
             * @description Vide = indécis.
             */
            readonly formula: number | null;
            /** @default Indécis */
            readonly formula_name: string;
            /** Nom */
            readonly name: string;
            /** @description Format +225XXXXXXXXXX. */
            readonly whatsapp: string;
            /**
             * E-mail
             * Format: email
             */
            readonly email: string;
            readonly message: string;
            /** Statut */
            status?: components["schemas"]["QuoteStatusEnum"];
            readonly status_display: string;
            /**
             * Note interne
             * @description Visible du personnel seulement.
             */
            internal_note?: string;
            /**
             * Créé le
             * Format: date-time
             */
            readonly created_at: string;
            /**
             * Modifié le
             * Format: date-time
             */
            readonly updated_at: string;
        };
        /**
         * @description * `new` - Nouvelle
         *     * `contacted` - Client contacté
         *     * `quote_sent` - Devis envoyé
         *     * `won` - Gagnée
         *     * `lost` - Perdue
         * @enum {string}
         */
        QuoteStatusEnum: "new" | "contacted" | "quote_sent" | "won" | "lost";
        Refuse: {
            reason: string;
        };
        ReservationCreate: {
            /** Format: date */
            date: string;
            /** Format: time */
            time: string;
            party_size: number;
            name: string;
            phone: string;
            /** @default  */
            note: string;
        };
        /** @description Réponse au site : jamais le nom ni le téléphone. */
        ReservationPublic: {
            /** Référence */
            readonly reference: string;
            /** Statut */
            status?: components["schemas"]["ReservationStatusEnum"];
            /** Format: date */
            date: string;
            /** Format: time */
            time: string;
            /** Personnes */
            party_size: number;
        };
        ReservationStaff: {
            readonly id: number;
            /** Référence */
            readonly reference: string;
            /** Format: date */
            readonly date: string;
            /** Format: time */
            time: string;
            /** Personnes */
            readonly party_size: number;
            /** Nom */
            readonly name: string;
            /**
             * Téléphone
             * @description Format +225XXXXXXXXXX.
             */
            readonly phone: string;
            readonly note: string;
            /** Statut */
            readonly status: components["schemas"]["ReservationStatusEnum"];
            readonly status_display: string;
            /** Origine */
            readonly source: components["schemas"]["ReservationStaffSourceEnum"];
            readonly table: number | null;
            readonly table_number: number;
            readonly handled_by: string;
            /**
             * Traitée le
             * Format: date-time
             */
            readonly handled_at: string | null;
            /** Motif du refus */
            readonly refusal_reason: string;
            /**
             * Créé le
             * Format: date-time
             */
            readonly created_at: string;
        };
        /**
         * @description * `site` - Site
         *     * `phone` - Téléphone
         *     * `walk_in` - Sur place
         * @enum {string}
         */
        ReservationStaffSourceEnum: "site" | "phone" | "walk_in";
        /**
         * @description * `pending` - En attente
         *     * `confirmed` - Confirmée
         *     * `refused` - Refusée
         *     * `cancelled` - Annulée
         *     * `no_show` - Non venu
         *     * `completed` - Terminée
         * @enum {string}
         */
        ReservationStatusEnum: "pending" | "confirmed" | "refused" | "cancelled" | "no_show" | "completed";
        Slot: {
            /** Format: time */
            time: string;
            available: boolean;
        };
        StaffReservationCreate: {
            /** Format: date */
            date: string;
            /** Format: time */
            time: string;
            party_size: number;
            name: string;
            phone: string;
            /** @default  */
            note: string;
            /** @default phone */
            source: components["schemas"]["StaffReservationCreateSourceEnum"];
        };
        /**
         * @description * `phone` - phone
         *     * `walk_in` - walk_in
         * @enum {string}
         */
        StaffReservationCreateSourceEnum: "phone" | "walk_in";
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
    api_v1_catering_formulas_list: {
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
                    "application/json": components["schemas"]["PublicFormula"][];
                };
            };
        };
    };
    api_v1_catering_quotes_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QuoteCreate"];
                "application/x-www-form-urlencoded": components["schemas"]["QuoteCreate"];
                "multipart/form-data": components["schemas"]["QuoteCreate"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["QuoteCreated"];
                };
            };
        };
    };
    api_v1_manage_quotes_list: {
        parameters: {
            query?: {
                /** @description A page number within the paginated result set. */
                page?: number;
                /**
                 * @description * `new` - Nouvelle
                 *     * `contacted` - Client contacté
                 *     * `quote_sent` - Devis envoyé
                 *     * `won` - Gagnée
                 *     * `lost` - Perdue
                 */
                status?: "contacted" | "lost" | "new" | "quote_sent" | "won";
            };
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
                    "application/json": components["schemas"]["PaginatedQuoteStaffList"];
                };
            };
        };
    };
    api_v1_manage_quotes_retrieve: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this demande de devis. */
                id: number;
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
                    "application/json": components["schemas"]["QuoteStaff"];
                };
            };
        };
    };
    api_v1_manage_quotes_partial_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this demande de devis. */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["PatchedQuoteStaff"];
                "application/x-www-form-urlencoded": components["schemas"]["PatchedQuoteStaff"];
                "multipart/form-data": components["schemas"]["PatchedQuoteStaff"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["QuoteStaff"];
                };
            };
        };
    };
    api_v1_manage_reservations_list: {
        parameters: {
            query?: {
                date?: string;
                /** @description A page number within the paginated result set. */
                page?: number;
                /**
                 * @description * `site` - Site
                 *     * `phone` - Téléphone
                 *     * `walk_in` - Sur place
                 */
                source?: "phone" | "site" | "walk_in";
                /**
                 * @description * `pending` - En attente
                 *     * `confirmed` - Confirmée
                 *     * `refused` - Refusée
                 *     * `cancelled` - Annulée
                 *     * `no_show` - Non venu
                 *     * `completed` - Terminée
                 */
                status?: "cancelled" | "completed" | "confirmed" | "no_show" | "pending" | "refused";
            };
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
                    "application/json": components["schemas"]["PaginatedReservationStaffList"];
                };
            };
        };
    };
    api_v1_manage_reservations_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StaffReservationCreate"];
                "application/x-www-form-urlencoded": components["schemas"]["StaffReservationCreate"];
                "multipart/form-data": components["schemas"]["StaffReservationCreate"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionResult"];
                };
            };
        };
    };
    api_v1_manage_reservations_retrieve: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this réservation. */
                id: number;
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
                    "application/json": components["schemas"]["ReservationStaff"];
                };
            };
        };
    };
    api_v1_manage_reservations_cancel_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this réservation. */
                id: number;
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
                    "application/json": components["schemas"]["ActionResult"];
                };
            };
        };
    };
    api_v1_manage_reservations_complete_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this réservation. */
                id: number;
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
                    "application/json": components["schemas"]["ActionResult"];
                };
            };
        };
    };
    api_v1_manage_reservations_confirm_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this réservation. */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Confirm"];
                "application/x-www-form-urlencoded": components["schemas"]["Confirm"];
                "multipart/form-data": components["schemas"]["Confirm"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionResult"];
                };
            };
        };
    };
    api_v1_manage_reservations_no_show_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this réservation. */
                id: number;
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
                    "application/json": components["schemas"]["ActionResult"];
                };
            };
        };
    };
    api_v1_manage_reservations_refuse_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this réservation. */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Refuse"];
                "application/x-www-form-urlencoded": components["schemas"]["Refuse"];
                "multipart/form-data": components["schemas"]["Refuse"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionResult"];
                };
            };
        };
    };
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
    api_v1_reservations_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReservationCreate"];
                "application/x-www-form-urlencoded": components["schemas"]["ReservationCreate"];
                "multipart/form-data": components["schemas"]["ReservationCreate"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReservationPublic"];
                };
            };
        };
    };
    api_v1_reservations_availability_retrieve: {
        parameters: {
            query: {
                date: string;
                party: number;
            };
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
                    "application/json": components["schemas"]["Availability"];
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
