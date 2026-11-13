export interface paths {
    "/api/v1/auth/logout/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Déconnexion (jeton de rafraîchissement en liste noire) */
        post: operations["api_v1_auth_logout_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Membre du personnel connecté et son rôle */
        get: operations["api_v1_auth_me_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/token/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Connexion du personnel : {username, password} → {access, refresh}. django-axes verrouille après 5 échecs. */
        post: operations["api_v1_auth_token_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/token/refresh/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Nouveau jeton d'accès ; le jeton de rafraîchissement tourne et l'ancien part en liste noire. */
        post: operations["api_v1_auth_token_refresh_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
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
    "/api/v1/manage/dishes/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Tous les plats avec leur disponibilité (personnel)
         * @description Tous les plats, en rupture compris, dans l'ordre de la carte : liste des ruptures de l'écran cuisine.
         */
        get: operations["api_v1_manage_dishes_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/dishes/{id}/availability/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Plat disponible ou en rupture
         * @description Rupture de stock en un clic, depuis la caisse, la cuisine ou le tableau de bord du gérant.
         */
        patch: operations["api_v1_manage_dishes_availability_partial_update"];
        trace?: never;
    };
    "/api/v1/manage/events/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Événements depuis le curseur
         * @description Polling toutes les 3 à 5 s. Sans ?after= (ouverture de l'écran), on ne renvoie que le curseur actuel :
         *     l'écran charge l'état complet par REST, puis relit les événements à partir de ce curseur.
         */
        get: operations["api_v1_manage_events_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/orders/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * @description Gestion, caisse et serveurs : toutes les commandes ; cuisine : commandes actives seulement.
         *     Les droits de chaque transition sont vérifiés par les services (advance, cancel).
         */
        get: operations["api_v1_manage_orders_list"];
        put?: never;
        /**
         * Saisie au comptoir, ou pour une table sans téléphone
         * @description Gestion, caisse et serveurs : toutes les commandes ; cuisine : commandes actives seulement.
         *     Les droits de chaque transition sont vérifiés par les services (advance, cancel).
         */
        post: operations["api_v1_manage_orders_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/orders/{id}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * @description Gestion, caisse et serveurs : toutes les commandes ; cuisine : commandes actives seulement.
         *     Les droits de chaque transition sont vérifiés par les services (advance, cancel).
         */
        get: operations["api_v1_manage_orders_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/orders/{id}/advance/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Étape suivante de la commande
         * @description Gestion, caisse et serveurs : toutes les commandes ; cuisine : commandes actives seulement.
         *     Les droits de chaque transition sont vérifiés par les services (advance, cancel).
         */
        post: operations["api_v1_manage_orders_advance_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/orders/{id}/cancel/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Annuler (gérant, caisse)
         * @description Gestion, caisse et serveurs : toutes les commandes ; cuisine : commandes actives seulement.
         *     Les droits de chaque transition sont vérifiés par les services (advance, cancel).
         */
        post: operations["api_v1_manage_orders_cancel_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/orders/{id}/pay/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Encaisser une commande au comptoir
         * @description Gestion, caisse et serveurs : toutes les commandes ; cuisine : commandes actives seulement.
         *     Les droits de chaque transition sont vérifiés par les services (advance, cancel).
         */
        post: operations["api_v1_manage_orders_pay_create"];
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
    "/api/v1/manage/receipts/{number}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Reçu, avec les mentions légales du ticket 80 mm */
        get: operations["api_v1_manage_receipts_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/receipts/{number}.pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Reçu (PDF A4) */
        get: operations["api_v1_manage_receipts_.pdf_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/requests/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["api_v1_manage_requests_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/requests/{id}/done/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Demande traitée */
        post: operations["api_v1_manage_requests_done_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
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
    "/api/v1/manage/sessions/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["api_v1_manage_sessions_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/sessions/{id}/pay/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Encaisser l'addition (caisse, gérant) */
        post: operations["api_v1_manage_sessions_pay_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/tables/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["api_v1_manage_tables_list"];
        put?: never;
        post: operations["api_v1_manage_tables_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/tables/{id}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["api_v1_manage_tables_retrieve"];
        put: operations["api_v1_manage_tables_update"];
        post?: never;
        delete: operations["api_v1_manage_tables_destroy"];
        options?: never;
        head?: never;
        patch: operations["api_v1_manage_tables_partial_update"];
        trace?: never;
    };
    "/api/v1/manage/tables/{id}/qr.png": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** QR de la table (PNG) */
        get: operations["api_v1_manage_tables_qr.png_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/tables/{id}/regenerate-qr/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Nouveau QR : l'ancien chevalet ne fonctionne plus */
        post: operations["api_v1_manage_tables_regenerate_qr_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/tables/qr-sheet.pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Planche de chevalets A5 des tables actives (PDF) */
        get: operations["api_v1_manage_tables_qr_sheet.pdf_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/zones/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["api_v1_manage_zones_list"];
        put?: never;
        post: operations["api_v1_manage_zones_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/zones/{id}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["api_v1_manage_zones_retrieve"];
        put: operations["api_v1_manage_zones_update"];
        post?: never;
        delete: operations["api_v1_manage_zones_destroy"];
        options?: never;
        head?: never;
        patch: operations["api_v1_manage_zones_partial_update"];
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
    "/api/v1/table/events/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Événements depuis le curseur
         * @description Polling toutes les 3 à 5 s. Sans ?after= (ouverture de l'écran), on ne renvoie que le curseur actuel :
         *     l'écran charge l'état complet par REST, puis relit les événements à partir de ce curseur.
         */
        get: operations["api_v1_table_events_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/table/orders/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Envoyer une commande en cuisine
         * @description Routes du téléphone : en-tête X-Session-Token ; par session, 120 lectures et 30 écritures par minute.
         */
        post: operations["api_v1_table_orders_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/table/orders/{number}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Suivi d'une commande de cette table
         * @description Routes du téléphone : en-tête X-Session-Token ; par session, 120 lectures et 30 écritures par minute.
         */
        get: operations["api_v1_table_orders_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/table/receipts/{number}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Reçu de cette table
         * @description Routes du téléphone : en-tête X-Session-Token ; par session, 120 lectures et 30 écritures par minute.
         */
        get: operations["api_v1_table_receipts_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/table/receipts/{number}.pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Reçu de cette table (PDF A4)
         * @description Routes du téléphone : en-tête X-Session-Token ; par session, 120 lectures et 30 écritures par minute.
         */
        get: operations["api_v1_table_receipts_.pdf_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/table/requests/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Appeler un serveur ou demander l'addition
         * @description Routes du téléphone : en-tête X-Session-Token ; par session, 120 lectures et 30 écritures par minute.
         */
        post: operations["api_v1_table_requests_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/table/session/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Session, commandes, demandes ouvertes et addition
         * @description Routes du téléphone : en-tête X-Session-Token ; par session, 120 lectures et 30 écritures par minute.
         */
        get: operations["api_v1_table_session_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/table/sessions/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ouvrir ou reprendre la session de la table scannée
         * @description Routes du téléphone : en-tête X-Session-Token ; par session, 120 lectures et 30 écritures par minute.
         */
        post: operations["api_v1_table_sessions_create"];
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
        /** @enum {unknown} */
        BlankEnum: "";
        CancelOrder: {
            reason: string;
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
        /**
         * @description * `table` - À table (QR)
         *     * `counter` - Comptoir
         * @enum {string}
         */
        ChannelEnum: "table" | "counter";
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
        DishAvailability: {
            readonly id: number;
            /** Nom */
            readonly name: string;
            /**
             * Disponible
             * @description Décocher pour une rupture de stock.
             */
            is_available: boolean;
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
        Event: {
            readonly id: number;
            type: string;
            /** Contenu */
            data?: unknown;
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
        Events: {
            /** @description À renvoyer dans ?after= au prochain appel. */
            cursor: number;
            events: components["schemas"]["Event"][];
        };
        /**
         * @description * `waiter` - Appel serveur
         *     * `bill` - Addition
         * @enum {string}
         */
        KindEnum: "waiter" | "bill";
        Logout: {
            refresh: string;
        };
        Me: {
            id: number;
            username: string;
            readonly name: string;
            role: string;
            role_display: string;
        };
        OpenSession: {
            qr_token: string;
        };
        OpenSessionSummary: {
            readonly id: number;
            table: components["schemas"]["TableInfo"];
            /** Statut */
            status?: components["schemas"]["TableSessionStatusEnum"];
            readonly status_display: string;
            /**
             * Créé le
             * Format: date-time
             */
            readonly created_at: string;
            /**
             * Dernière activité
             * Format: date-time
             */
            readonly last_activity_at: string;
            orders_count: number;
            /** @description Montant en cours : commandes non annulées. */
            total: number;
            /** @description Types de demandes en attente. */
            open_requests: string[];
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
        OrderItem: {
            /** Plat */
            dish_name: string;
            /** Quantité */
            quantity: number;
            /** Prix du plat (FCFA) */
            unit_price: number;
            /**
             * Options
             * @description Ex. Attiéké · piment doux.
             */
            options_label?: string;
            /**
             * Suppléments (FCFA)
             * @description Par exemplaire.
             */
            options_price?: number;
            /** Précision pour la cuisine */
            note?: string;
            /** Total de la ligne (FCFA) */
            line_total: number;
        };
        OrderItemOption: {
            /** Option */
            name: string;
            /** Supplément (FCFA) */
            price_delta?: number;
        };
        OrderLineInput: {
            dish_id: number;
            /** @default 1 */
            quantity: number;
            option_ids?: number[];
            /** @default  */
            note: string;
        };
        /**
         * @description * `received` - Reçue
         *     * `preparing` - En préparation
         *     * `ready` - Prête
         *     * `served` - Servie
         *     * `cancelled` - Annulée
         * @enum {string}
         */
        OrderStatusEnum: "received" | "preparing" | "ready" | "served" | "cancelled";
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
        PaginatedStaffOrderList: {
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
            results: components["schemas"]["StaffOrder"][];
        };
        PatchedDishAvailability: {
            readonly id?: number;
            /** Nom */
            readonly name?: string;
            /**
             * Disponible
             * @description Décocher pour une rupture de stock.
             */
            is_available?: boolean;
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
        PatchedTable: {
            readonly id?: number;
            /** Numéro */
            number?: number;
            zone?: number;
            readonly zone_name?: string;
            /** Places */
            seats?: number;
            /** Active */
            is_active?: boolean;
            readonly qr_url?: string;
            /** Version du QR */
            readonly qr_version?: number;
        };
        PatchedZone: {
            readonly id?: number;
            /**
             * Nom
             * @description Ex. Salle, Terrasse.
             */
            name?: string;
            /** Ordre */
            position?: number;
        };
        Pay: {
            method: components["schemas"]["PaymentMethodEnum"];
            /** @default  */
            transaction_ref: string;
            /** @description Seulement ces commandes ; absent = toute l'addition. */
            order_ids?: number[];
        };
        /**
         * @description * `wave` - Wave
         *     * `orange_money` - Orange Money
         *     * `mtn_momo` - MTN MoMo
         *     * `cash` - Espèces
         * @enum {string}
         */
        PaymentMethodEnum: "wave" | "orange_money" | "mtn_momo" | "cash";
        /**
         * @description * `now` - Maintenant
         *     * `end` - À la fin du repas
         * @enum {string}
         */
        PaymentTimingEnum: "now" | "end";
        PlaceOrder: {
            items: components["schemas"]["OrderLineInput"][];
            /** @default end */
            payment_timing: components["schemas"]["PaymentTimingEnum"];
            /** @default  */
            payment_method: components["schemas"]["PaymentMethodEnum"] | components["schemas"]["BlankEnum"];
            /** @default  */
            note: string;
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
        /** @description Données communes aux trois reçus : écran (F3), ticket 80 mm (F5) et PDF A4. */
        Receipt: {
            /** Numéro */
            readonly number: number;
            readonly reference: string;
            /** Total (FCFA) */
            total: number;
            /** Moyen de paiement */
            method: components["schemas"]["PaymentMethodEnum"];
            readonly method_display: string;
            /** Référence de transaction */
            transaction_ref?: string;
            /**
             * Payé le
             * Format: date-time
             */
            paid_at: string;
            readonly table_number: number;
            readonly cashier: string;
            readonly orders: components["schemas"]["ReceiptOrder"][];
        };
        ReceiptLegal: {
            rccm: string;
            ncc: string;
            /** Format: decimal */
            vat_rate: string | null;
        };
        ReceiptOrder: {
            /** Numéro */
            readonly number: number;
            /** Total (FCFA) */
            total?: number;
            readonly items: components["schemas"]["OrderItem"][];
        };
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
        ServiceRequest: {
            readonly id: number;
            /** Type */
            kind: components["schemas"]["KindEnum"];
            /** Statut */
            status?: components["schemas"]["ServiceRequestStatusEnum"];
            /**
             * Créé le
             * Format: date-time
             */
            readonly created_at: string;
        };
        ServiceRequestInput: {
            kind: components["schemas"]["KindEnum"];
        };
        /**
         * @description * `open` - En attente
         *     * `done` - Traitée
         * @enum {string}
         */
        ServiceRequestStatusEnum: "open" | "done";
        SessionOpened: {
            session_token: string;
            table: components["schemas"]["TableInfo"];
            status: components["schemas"]["TableSessionStatusEnum"];
        };
        SessionState: {
            table: components["schemas"]["TableInfo"];
            status: components["schemas"]["TableSessionStatusEnum"];
            orders: components["schemas"]["TableOrder"][];
            open_requests: components["schemas"]["ServiceRequest"][];
            /** @description Addition en cours : commandes non annulées. */
            total: number;
        };
        Slot: {
            /** Format: time */
            time: string;
            available: boolean;
        };
        /** @description Plat vu par le personnel (écran cuisine, ruptures) : disponible ou non, avec sa place dans la carte. */
        StaffDish: {
            readonly id: number;
            /** Nom */
            name: string;
            readonly category: string;
            readonly subcategory: string;
            /**
             * Disponible
             * @description Décocher pour une rupture de stock.
             */
            is_available?: boolean;
        };
        /** @description Commande vue par le personnel : table, lignes détaillées, qui l'a saisie et qui l'a fait avancer. */
        StaffOrder: {
            readonly id: number;
            /** Numéro */
            readonly number: number;
            /** Canal */
            channel?: components["schemas"]["ChannelEnum"];
            readonly channel_display: string;
            /** @description Vide pour une saisie au comptoir. */
            session?: number | null;
            readonly table_number: number;
            /** Statut */
            status?: components["schemas"]["OrderStatusEnum"];
            readonly status_display: string;
            /** Paiement */
            payment_timing?: components["schemas"]["PaymentTimingEnum"];
            /**
             * Moyen souhaité
             * @description Choisi par le client ; la caisse confirme à l'encaissement.
             *
             *     * `wave` - Wave
             *     * `orange_money` - Orange Money
             *     * `mtn_momo` - MTN MoMo
             *     * `cash` - Espèces
             */
            payment_method?: components["schemas"]["PaymentMethodEnum"] | components["schemas"]["BlankEnum"];
            /** Total (FCFA) */
            total?: number;
            /** Temps estimé (min) */
            eta_minutes?: number;
            /** Note pour la cuisine */
            note?: string;
            readonly items: components["schemas"]["StaffOrderItem"][];
            /**
             * Créé le
             * Format: date-time
             */
            readonly created_at: string;
            /**
             * En préparation le
             * Format: date-time
             */
            accepted_at?: string | null;
            /**
             * Prête le
             * Format: date-time
             */
            ready_at?: string | null;
            /**
             * Servie le
             * Format: date-time
             */
            served_at?: string | null;
            /**
             * Annulée le
             * Format: date-time
             */
            cancelled_at?: string | null;
            /** Motif d'annulation */
            cancel_reason?: string;
            readonly created_by: string;
            readonly status_changed_by: string;
            /** @description Numéro du reçu une fois la commande payée ; null avant. */
            readonly receipt_number: number;
        };
        StaffOrderItem: {
            readonly id: number;
            /** Plat */
            dish: number;
            /** Plat */
            dish_name: string;
            /** Quantité */
            quantity: number;
            /** Prix du plat (FCFA) */
            unit_price: number;
            /**
             * Options
             * @description Ex. Attiéké · piment doux.
             */
            options_label?: string;
            /**
             * Suppléments (FCFA)
             * @description Par exemplaire.
             */
            options_price?: number;
            /** Précision pour la cuisine */
            note?: string;
            /** Total de la ligne (FCFA) */
            line_total: number;
            readonly options: components["schemas"]["OrderItemOption"][];
        };
        StaffPlaceOrder: {
            items: components["schemas"]["OrderLineInput"][];
            /** @default end */
            payment_timing: components["schemas"]["PaymentTimingEnum"];
            /** @default  */
            payment_method: components["schemas"]["PaymentMethodEnum"] | components["schemas"]["BlankEnum"];
            /** @default  */
            note: string;
            /** @description Table sans téléphone ; vide = commande au comptoir. */
            table_number?: number | null;
        };
        /** @description Reçu vu par la caisse : en plus, les mentions légales du ticket 80 mm (vides tant que non saisies). */
        StaffReceipt: {
            /** Numéro */
            readonly number: number;
            readonly reference: string;
            /** Total (FCFA) */
            total: number;
            /** Moyen de paiement */
            method: components["schemas"]["PaymentMethodEnum"];
            readonly method_display: string;
            /** Référence de transaction */
            transaction_ref?: string;
            /**
             * Payé le
             * Format: date-time
             */
            paid_at: string;
            readonly table_number: number;
            readonly cashier: string;
            readonly orders: components["schemas"]["ReceiptOrder"][];
            readonly legal: components["schemas"]["ReceiptLegal"];
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
        StaffServiceRequest: {
            readonly id: number;
            session: number;
            readonly table_number: number;
            /** Type */
            kind: components["schemas"]["KindEnum"];
            readonly kind_display: string;
            /** Statut */
            status?: components["schemas"]["ServiceRequestStatusEnum"];
            /**
             * Créé le
             * Format: date-time
             */
            readonly created_at: string;
            readonly handled_by: string;
            /**
             * Traitée le
             * Format: date-time
             */
            handled_at?: string | null;
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
        Table: {
            readonly id: number;
            /** Numéro */
            number: number;
            zone: number;
            readonly zone_name: string;
            /** Places */
            seats?: number;
            /** Active */
            is_active?: boolean;
            readonly qr_url: string;
            /** Version du QR */
            readonly qr_version: number;
        };
        TableInfo: {
            number: number;
            zone: string;
        };
        /** @description Commande vue par le téléphone : jamais qui l'a traitée. */
        TableOrder: {
            /** Numéro */
            readonly number: number;
            /** Statut */
            status?: components["schemas"]["OrderStatusEnum"];
            readonly status_display: string;
            /** Paiement */
            payment_timing?: components["schemas"]["PaymentTimingEnum"];
            /**
             * Moyen souhaité
             * @description Choisi par le client ; la caisse confirme à l'encaissement.
             *
             *     * `wave` - Wave
             *     * `orange_money` - Orange Money
             *     * `mtn_momo` - MTN MoMo
             *     * `cash` - Espèces
             */
            payment_method?: components["schemas"]["PaymentMethodEnum"] | components["schemas"]["BlankEnum"];
            /** Total (FCFA) */
            total?: number;
            /** Temps estimé (min) */
            eta_minutes?: number;
            /** Note pour la cuisine */
            note?: string;
            readonly items: components["schemas"]["OrderItem"][];
            /**
             * Créé le
             * Format: date-time
             */
            readonly created_at: string;
            /**
             * En préparation le
             * Format: date-time
             */
            accepted_at?: string | null;
            /**
             * Prête le
             * Format: date-time
             */
            ready_at?: string | null;
            /**
             * Servie le
             * Format: date-time
             */
            served_at?: string | null;
            /**
             * Annulée le
             * Format: date-time
             */
            cancelled_at?: string | null;
            /** Motif d'annulation */
            cancel_reason?: string;
            /** @description Numéro du reçu une fois la commande payée ; null avant. */
            readonly receipt_number: number;
        };
        /**
         * @description * `open` - Ouverte
         *     * `bill_requested` - Addition demandée
         *     * `closed` - Fermée
         * @enum {string}
         */
        TableSessionStatusEnum: "open" | "bill_requested" | "closed";
        TokenObtainPair: {
            username: string;
            password: string;
            readonly access: string;
            readonly refresh: string;
        };
        TokenRefresh: {
            readonly access: string;
            refresh: string;
        };
        Zone: {
            readonly id: number;
            /**
             * Nom
             * @description Ex. Salle, Terrasse.
             */
            name: string;
            /** Ordre */
            position?: number;
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
    api_v1_auth_logout_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Logout"];
                "application/x-www-form-urlencoded": components["schemas"]["Logout"];
                "multipart/form-data": components["schemas"]["Logout"];
            };
        };
        responses: {
            /** @description No response body */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    api_v1_auth_me_retrieve: {
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
                    "application/json": components["schemas"]["Me"];
                };
            };
        };
    };
    api_v1_auth_token_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TokenObtainPair"];
                "application/x-www-form-urlencoded": components["schemas"]["TokenObtainPair"];
                "multipart/form-data": components["schemas"]["TokenObtainPair"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TokenObtainPair"];
                };
            };
        };
    };
    api_v1_auth_token_refresh_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TokenRefresh"];
                "application/x-www-form-urlencoded": components["schemas"]["TokenRefresh"];
                "multipart/form-data": components["schemas"]["TokenRefresh"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TokenRefresh"];
                };
            };
        };
    };
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
    api_v1_manage_dishes_list: {
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
                    "application/json": components["schemas"]["StaffDish"][];
                };
            };
        };
    };
    api_v1_manage_dishes_availability_partial_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["PatchedDishAvailability"];
                "application/x-www-form-urlencoded": components["schemas"]["PatchedDishAvailability"];
                "multipart/form-data": components["schemas"]["PatchedDishAvailability"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DishAvailability"];
                };
            };
        };
    };
    api_v1_manage_events_retrieve: {
        parameters: {
            query?: {
                /** @description Curseur du dernier appel. */
                after?: number;
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
                    "application/json": components["schemas"]["Events"];
                };
            };
        };
    };
    api_v1_manage_orders_list: {
        parameters: {
            query?: {
                /**
                 * @description * `table` - À table (QR)
                 *     * `counter` - Comptoir
                 */
                channel?: "counter" | "table";
                /** @description AAAA-MM-JJ, heure d'Abidjan. */
                date?: string;
                /** @description A page number within the paginated result set. */
                page?: number;
                /** @description Un ou plusieurs statuts, séparés par des virgules. */
                status?: string;
                /** @description Numéro de table. */
                table?: number;
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
                    "application/json": components["schemas"]["PaginatedStaffOrderList"];
                };
            };
        };
    };
    api_v1_manage_orders_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StaffPlaceOrder"];
                "application/x-www-form-urlencoded": components["schemas"]["StaffPlaceOrder"];
                "multipart/form-data": components["schemas"]["StaffPlaceOrder"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StaffOrder"];
                };
            };
        };
    };
    api_v1_manage_orders_retrieve: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this commande. */
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
                    "application/json": components["schemas"]["StaffOrder"];
                };
            };
        };
    };
    api_v1_manage_orders_advance_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this commande. */
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
                    "application/json": components["schemas"]["StaffOrder"];
                };
            };
        };
    };
    api_v1_manage_orders_cancel_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this commande. */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CancelOrder"];
                "application/x-www-form-urlencoded": components["schemas"]["CancelOrder"];
                "multipart/form-data": components["schemas"]["CancelOrder"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StaffOrder"];
                };
            };
        };
    };
    api_v1_manage_orders_pay_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this commande. */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Pay"];
                "application/x-www-form-urlencoded": components["schemas"]["Pay"];
                "multipart/form-data": components["schemas"]["Pay"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Receipt"];
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
    api_v1_manage_receipts_retrieve: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                number: number;
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
                    "application/json": components["schemas"]["StaffReceipt"];
                };
            };
        };
    };
    "api_v1_manage_receipts_.pdf_retrieve": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                number: number;
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
                    "application/pdf": string;
                };
            };
        };
    };
    api_v1_manage_requests_list: {
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
                    "application/json": components["schemas"]["StaffServiceRequest"][];
                };
            };
        };
    };
    api_v1_manage_requests_done_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this demande de la table. */
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
                    "application/json": components["schemas"]["StaffServiceRequest"];
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
    api_v1_manage_sessions_list: {
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
                    "application/json": components["schemas"]["OpenSessionSummary"][];
                };
            };
        };
    };
    api_v1_manage_sessions_pay_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this session de table. */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Pay"];
                "application/x-www-form-urlencoded": components["schemas"]["Pay"];
                "multipart/form-data": components["schemas"]["Pay"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Receipt"];
                };
            };
        };
    };
    api_v1_manage_tables_list: {
        parameters: {
            query?: {
                is_active?: boolean;
                number?: number;
                zone?: number;
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
                    "application/json": components["schemas"]["Table"][];
                };
            };
        };
    };
    api_v1_manage_tables_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Table"];
                "application/x-www-form-urlencoded": components["schemas"]["Table"];
                "multipart/form-data": components["schemas"]["Table"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Table"];
                };
            };
        };
    };
    api_v1_manage_tables_retrieve: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this table. */
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
                    "application/json": components["schemas"]["Table"];
                };
            };
        };
    };
    api_v1_manage_tables_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this table. */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Table"];
                "application/x-www-form-urlencoded": components["schemas"]["Table"];
                "multipart/form-data": components["schemas"]["Table"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Table"];
                };
            };
        };
    };
    api_v1_manage_tables_destroy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this table. */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No response body */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    api_v1_manage_tables_partial_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this table. */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["PatchedTable"];
                "application/x-www-form-urlencoded": components["schemas"]["PatchedTable"];
                "multipart/form-data": components["schemas"]["PatchedTable"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Table"];
                };
            };
        };
    };
    "api_v1_manage_tables_qr.png_retrieve": {
        parameters: {
            query?: never;
            header?: never;
            path: {
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
                    "image/png": string;
                };
            };
        };
    };
    api_v1_manage_tables_regenerate_qr_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this table. */
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
                    "application/json": components["schemas"]["Table"];
                };
            };
        };
    };
    "api_v1_manage_tables_qr_sheet.pdf_retrieve": {
        parameters: {
            query?: {
                /** @description Seulement cette table (chevalet à réimprimer) */
                number?: number;
                /** @description Seulement les tables de cette zone */
                zone?: number;
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
                    "application/pdf": string;
                };
            };
        };
    };
    api_v1_manage_zones_list: {
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
                    "application/json": components["schemas"]["Zone"][];
                };
            };
        };
    };
    api_v1_manage_zones_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Zone"];
                "application/x-www-form-urlencoded": components["schemas"]["Zone"];
                "multipart/form-data": components["schemas"]["Zone"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Zone"];
                };
            };
        };
    };
    api_v1_manage_zones_retrieve: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this zone. */
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
                    "application/json": components["schemas"]["Zone"];
                };
            };
        };
    };
    api_v1_manage_zones_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this zone. */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Zone"];
                "application/x-www-form-urlencoded": components["schemas"]["Zone"];
                "multipart/form-data": components["schemas"]["Zone"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Zone"];
                };
            };
        };
    };
    api_v1_manage_zones_destroy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this zone. */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No response body */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    api_v1_manage_zones_partial_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this zone. */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["PatchedZone"];
                "application/x-www-form-urlencoded": components["schemas"]["PatchedZone"];
                "multipart/form-data": components["schemas"]["PatchedZone"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Zone"];
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
    api_v1_table_events_retrieve: {
        parameters: {
            query?: {
                /** @description Curseur du dernier appel. */
                after?: number;
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
                    "application/json": components["schemas"]["Events"];
                };
            };
        };
    };
    api_v1_table_orders_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PlaceOrder"];
                "application/x-www-form-urlencoded": components["schemas"]["PlaceOrder"];
                "multipart/form-data": components["schemas"]["PlaceOrder"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TableOrder"];
                };
            };
        };
    };
    api_v1_table_orders_retrieve: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                number: number;
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
                    "application/json": components["schemas"]["TableOrder"];
                };
            };
        };
    };
    api_v1_table_receipts_retrieve: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                number: number;
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
                    "application/json": components["schemas"]["Receipt"];
                };
            };
        };
    };
    "api_v1_table_receipts_.pdf_retrieve": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                number: number;
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
                    "application/pdf": string;
                };
            };
        };
    };
    api_v1_table_requests_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ServiceRequestInput"];
                "application/x-www-form-urlencoded": components["schemas"]["ServiceRequestInput"];
                "multipart/form-data": components["schemas"]["ServiceRequestInput"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ServiceRequest"];
                };
            };
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ServiceRequest"];
                };
            };
        };
    };
    api_v1_table_session_retrieve: {
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
                    "application/json": components["schemas"]["SessionState"];
                };
            };
        };
    };
    api_v1_table_sessions_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OpenSession"];
                "application/x-www-form-urlencoded": components["schemas"]["OpenSession"];
                "multipart/form-data": components["schemas"]["OpenSession"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionOpened"];
                };
            };
        };
    };
}
