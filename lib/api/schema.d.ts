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
    "/api/v1/auth/password/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Changer mon mot de passe
         * @description Le membre connecté change son mot de passe (obligatoire après un mot de passe provisoire).
         */
        post: operations["api_v1_auth_password_create"];
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
    "/api/v1/manage/dashboard/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Tableau de bord du gérant
         * @description Vue d'ensemble du gérant : chiffres de la période, courbe, affluence, catégories, état de la salle.
         */
        get: operations["api_v1_manage_dashboard_retrieve"];
        put?: never;
        post?: never;
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
    "/api/v1/manage/menu/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Toute la carte, éléments masqués compris (gérant) */
        get: operations["api_v1_manage_menu_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/menu/categories/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView. */
        post: operations["api_v1_manage_menu_categories_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/menu/categories/{id}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView. */
        put: operations["api_v1_manage_menu_categories_update"];
        post?: never;
        /** @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView. */
        delete: operations["api_v1_manage_menu_categories_destroy"];
        options?: never;
        head?: never;
        /** @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView. */
        patch: operations["api_v1_manage_menu_categories_partial_update"];
        trace?: never;
    };
    "/api/v1/manage/menu/dishes/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView. */
        post: operations["api_v1_manage_menu_dishes_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/menu/dishes/{id}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView. */
        put: operations["api_v1_manage_menu_dishes_update"];
        post?: never;
        /** @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView. */
        delete: operations["api_v1_manage_menu_dishes_destroy"];
        options?: never;
        head?: never;
        /** @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView. */
        patch: operations["api_v1_manage_menu_dishes_partial_update"];
        trace?: never;
    };
    "/api/v1/manage/menu/dishes/{id}/photo/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Envoyer la photo
         * @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView.
         */
        put: operations["api_v1_manage_menu_dishes_photo_update"];
        post?: never;
        /**
         * Retirer la photo
         * @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView.
         */
        delete: operations["api_v1_manage_menu_dishes_photo_destroy"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/menu/reorder/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Changer l'ordre d'affichage */
        post: operations["api_v1_manage_menu_reorder_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/menu/subcategories/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView. */
        post: operations["api_v1_manage_menu_subcategories_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/menu/subcategories/{id}/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView. */
        put: operations["api_v1_manage_menu_subcategories_update"];
        post?: never;
        /** @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView. */
        delete: operations["api_v1_manage_menu_subcategories_destroy"];
        options?: never;
        head?: never;
        /** @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView. */
        patch: operations["api_v1_manage_menu_subcategories_partial_update"];
        trace?: never;
    };
    "/api/v1/manage/menu/subcategories/{id}/photo/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Envoyer la photo
         * @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView.
         */
        put: operations["api_v1_manage_menu_subcategories_photo_update"];
        post?: never;
        /**
         * Retirer la photo
         * @description Créer, modifier, supprimer. La lecture de la carte se fait d'un coup par ManageMenuView.
         */
        delete: operations["api_v1_manage_menu_subcategories_photo_destroy"];
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
    "/api/v1/manage/payments/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Paiements du jour (caisse, gérant)
         * @description Paiements d'une journée : reçus, totaux par moyen de paiement, reste à encaisser.
         */
        get: operations["api_v1_manage_payments_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/push/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Notifications du personnel : ce navigateur reçoit les alertes du rôle de la personne connectée. */
        get: operations["api_v1_manage_push_retrieve"];
        put?: never;
        /** @description Notifications du personnel : ce navigateur reçoit les alertes du rôle de la personne connectée. */
        post: operations["api_v1_manage_push_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/push/remove/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Désactive les notifications sur ce navigateur (bouton, ou déconnexion). */
        post: operations["api_v1_manage_push_remove_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/push/test/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Envoie une notification d'essai aux navigateurs de la personne connectée. */
        post: operations["api_v1_manage_push_test_create"];
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
    "/api/v1/manage/reports/activity.pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Rapport d'activité (PDF)
         * @description Rapport d'activité de la période (mêmes paramètres que le tableau de bord).
         */
        get: operations["api_v1_manage_reports_activity.pdf_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/reports/closing.pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Clôture de caisse (PDF)
         * @description Clôture de caisse d'une journée : encaissé par moyen, reçus, annulations, comptage et signatures.
         */
        get: operations["api_v1_manage_reports_closing.pdf_retrieve"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/reports/sales.pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Liste des ventes (PDF)
         * @description Liste détaillée des ventes : chaque reçu de la période et ses plats.
         */
        get: operations["api_v1_manage_reports_sales.pdf_retrieve"];
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
    "/api/v1/manage/staff/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * @description Comptes du personnel (gérant). Pas de suppression : un compte qui a servi reste dans l'historique
         *     des commandes et des reçus ; on le désactive.
         */
        get: operations["api_v1_manage_staff_list"];
        put?: never;
        /**
         * Créer un compte
         * @description Comptes du personnel (gérant). Pas de suppression : un compte qui a servi reste dans l'historique
         *     des commandes et des reçus ; on le désactive.
         */
        post: operations["api_v1_manage_staff_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/manage/staff/{id}/": {
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
         * @description Comptes du personnel (gérant). Pas de suppression : un compte qui a servi reste dans l'historique
         *     des commandes et des reçus ; on le désactive.
         */
        patch: operations["api_v1_manage_staff_partial_update"];
        trace?: never;
    };
    "/api/v1/manage/staff/{id}/reset-password/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Donner un mot de passe provisoire
         * @description Comptes du personnel (gérant). Pas de suppression : un compte qui a servi reste dans l'historique
         *     des commandes et des reçus ; on le désactive.
         */
        post: operations["api_v1_manage_staff_reset_password_create"];
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
    "/api/v1/manage/tables/bulk/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Créer plusieurs tables d'un coup (tout ou rien) */
        post: operations["api_v1_manage_tables_bulk_create"];
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
    "/api/v1/table/push/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Téléphone d'une table : prévenu quand sa commande avance et quand l'addition est réglée. */
        get: operations["api_v1_table_push_retrieve"];
        put?: never;
        /** @description Téléphone d'une table : prévenu quand sa commande avance et quand l'addition est réglée. */
        post: operations["api_v1_table_push_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/table/push/remove/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Le client ne veut plus être prévenu. */
        post: operations["api_v1_table_push_remove_create"];
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
        CategorySales: {
            name: string;
            quantity: number;
            /** @description Montant commandé (FCFA), hors annulations. */
            revenue: number;
            /**
             * Format: double
             * @description Part du montant commandé, en %.
             */
            share: number;
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
        Dashboard: {
            period: components["schemas"]["PeriodEnum"];
            /** Format: date */
            start: string;
            /** Format: date */
            end: string;
            days: number;
            current: components["schemas"]["Sales"];
            /** @description Période précédente de même durée. */
            previous: components["schemas"]["Sales"];
            by_method: components["schemas"]["MethodTotal"][];
            /**
             * @description day : un point par jour ; week : par semaine (lundi).
             *
             *     * `day` - day
             *     * `week` - week
             */
            trend_unit: components["schemas"]["TrendUnitEnum"];
            /** @description La période jour par jour (7 jours au moins), ou semaine par semaine au-delà de 62 jours. */
            trend: components["schemas"]["TrendDay"][];
            /** @description Les 24 heures de la journée, cumulées sur la période. */
            by_hour: components["schemas"]["Hour"][];
            by_category: components["schemas"]["CategorySales"][];
            top_dishes: components["schemas"]["TopDish"][];
            live: components["schemas"]["Live"];
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
        Hour: {
            /** @description Heure de la journée, 0 à 23 (heure d'Abidjan). */
            hour: number;
            orders_count: number;
            /** @description Montant commandé pendant cette heure (FCFA). */
            amount: number;
        };
        /**
         * @description * `waiter` - Appel serveur
         *     * `bill` - Addition
         * @enum {string}
         */
        KindEnum: "waiter" | "bill";
        /**
         * @description * `category` - category
         *     * `subcategory` - subcategory
         *     * `dish` - dish
         * @enum {string}
         */
        LevelEnum: "category" | "subcategory" | "dish";
        Live: {
            tables_total: number;
            tables_open: number;
            active_orders: number;
            open_requests: number;
            /** @description Commandes non payées, hors annulations (FCFA). */
            to_collect: number;
            unavailable_dishes: string[];
        };
        Logout: {
            refresh: string;
        };
        ManageCategory: {
            readonly id: number;
            readonly slug: string;
            /** Nom */
            name: string;
            /**
             * Icône
             * @description Emoji ou nom d'icône utilisé par le site.
             */
            icon?: string;
            /** Active */
            is_active?: boolean;
            /** Ordre */
            readonly position: number;
            readonly subcategories: components["schemas"]["ManageSubCategory"][];
        };
        /**
         * @description Plat complet pour l'écran « Carte & menus ». La photo s'envoie à part (…/photo/).
         *     option_groups, s'il est fourni, remplace tous les groupes du plat : ceux qui manquent sont supprimés.
         */
        ManageDish: {
            readonly id: number;
            readonly slug: string;
            /** Nom */
            name: string;
            description?: string;
            /** Prix (FCFA) */
            price: number;
            /** Format: uri */
            readonly photo: string;
            /** Sous-catégorie */
            subcategory: number;
            /**
             * Disponible
             * @description Décocher pour une rupture de stock.
             */
            is_available?: boolean;
            /**
             * Mis en avant
             * @description Affiché sur la page d'accueil.
             */
            is_featured?: boolean;
            /** Temps de préparation (min) */
            prep_minutes?: number;
            /** Ordre */
            readonly position: number;
            option_groups?: components["schemas"]["ManageOptionGroup"][];
        };
        ManageOption: {
            /** @description Absent pour une nouvelle option. */
            id?: number;
            /**
             * Nom
             * @description Ex. Foutou, Attiéké.
             */
            name: string;
            /** Supplément (FCFA) */
            price_delta?: number;
            /** Choisi par défaut */
            is_default?: boolean;
            /** Disponible */
            is_available?: boolean;
        };
        ManageOptionGroup: {
            /** @description Absent pour un nouveau groupe. */
            id?: number;
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
            options: components["schemas"]["ManageOption"][];
        };
        ManageSubCategory: {
            readonly id: number;
            readonly slug: string;
            /** Nom */
            name: string;
            /** Catégorie */
            category: number;
            /** Format: uri */
            readonly photo: string;
            /** Active */
            is_active?: boolean;
            /** Ordre */
            readonly position: number;
            readonly dishes: components["schemas"]["ManageDish"][];
        };
        Me: {
            id: number;
            username: string;
            readonly name: string;
            role: string;
            role_display: string;
            must_change_password: boolean;
        };
        MethodTotal: {
            method: string;
            label: string;
            total: number;
            count: number;
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
        PasswordChange: {
            current_password: string;
            new_password: string;
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
        PatchedManageCategory: {
            readonly id?: number;
            readonly slug?: string;
            /** Nom */
            name?: string;
            /**
             * Icône
             * @description Emoji ou nom d'icône utilisé par le site.
             */
            icon?: string;
            /** Active */
            is_active?: boolean;
            /** Ordre */
            readonly position?: number;
            readonly subcategories?: components["schemas"]["ManageSubCategory"][];
        };
        /**
         * @description Plat complet pour l'écran « Carte & menus ». La photo s'envoie à part (…/photo/).
         *     option_groups, s'il est fourni, remplace tous les groupes du plat : ceux qui manquent sont supprimés.
         */
        PatchedManageDish: {
            readonly id?: number;
            readonly slug?: string;
            /** Nom */
            name?: string;
            description?: string;
            /** Prix (FCFA) */
            price?: number;
            /** Format: uri */
            readonly photo?: string;
            /** Sous-catégorie */
            subcategory?: number;
            /**
             * Disponible
             * @description Décocher pour une rupture de stock.
             */
            is_available?: boolean;
            /**
             * Mis en avant
             * @description Affiché sur la page d'accueil.
             */
            is_featured?: boolean;
            /** Temps de préparation (min) */
            prep_minutes?: number;
            /** Ordre */
            readonly position?: number;
            option_groups?: components["schemas"]["ManageOptionGroup"][];
        };
        PatchedManageSubCategory: {
            readonly id?: number;
            readonly slug?: string;
            /** Nom */
            name?: string;
            /** Catégorie */
            category?: number;
            /** Format: uri */
            readonly photo?: string;
            /** Active */
            is_active?: boolean;
            /** Ordre */
            readonly position?: number;
            readonly dishes?: components["schemas"]["ManageDish"][];
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
         * @description Compte du personnel vu par le gérant. Le mot de passe ne se lit jamais : il est seulement remis
         *     une fois, en clair, dans la réponse de création ou de réinitialisation (temporary_password).
         */
        PatchedStaffMember: {
            readonly id?: number;
            /** @description Identifiant de connexion, mis en minuscules. */
            username?: string;
            /** Prénom */
            first_name?: string;
            /** Nom */
            last_name?: string;
            readonly name?: string;
            /** Téléphone */
            phone?: string;
            /** Rôle */
            role?: components["schemas"]["RoleEnum"];
            readonly role_display?: string;
            /**
             * Actif
             * @description Précise si l’utilisateur doit être considéré comme actif. Décochez ceci plutôt que de supprimer le compte.
             */
            is_active?: boolean;
            /** @description Compte propriétaire (superutilisateur) : modifiable par lui seul. */
            readonly is_owner?: boolean;
            /**
             * Doit changer son mot de passe
             * @description Mis à vrai quand le gérant crée le compte ou donne un mot de passe provisoire.
             */
            readonly must_change_password?: boolean;
            /**
             * Dernière connexion
             * Format: date-time
             */
            readonly last_login?: string | null;
            /**
             * Date d’inscription
             * Format: date-time
             */
            readonly date_joined?: string;
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
        Payments: {
            /** Format: date */
            date: string;
            /** @description Encaissé ce jour-là (FCFA). */
            revenue: number;
            receipts_count: number;
            /** @description Les quatre moyens de paiement, même à zéro. */
            by_method: components["schemas"]["MethodTotal"][];
            /** @description Commandes non payées à l'instant, toutes dates confondues. */
            to_collect: components["schemas"]["ToCollect"];
            receipts: components["schemas"]["ReceiptRow"][];
        };
        /**
         * @description * `today` - today
         *     * `week` - week
         *     * `month` - month
         *     * `custom` - custom
         * @enum {string}
         */
        PeriodEnum: "today" | "week" | "month" | "custom";
        Photo: {
            /**
             * Format: uri
             * @description JPEG, PNG ou WebP, 5 Mo au plus ; convertie en WebP.
             */
            photo: string;
        };
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
        PushConfig: {
            /** @description Clé publique VAPID, à passer à pushManager.subscribe(). */
            public_key: string;
            /** @description Faux tant que les clés VAPID ne sont pas dans le .env de l'API. */
            enabled: boolean;
        };
        PushEndpoint: {
            /** Format: uri */
            endpoint: string;
        };
        PushKeys: {
            p256dh: string;
            auth: string;
        };
        /** @description Le résultat de PushSubscription.toJSON() dans le navigateur. */
        PushSubscription: {
            /** Format: uri */
            endpoint: string;
            keys: components["schemas"]["PushKeys"];
            expirationTime?: number | null;
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
        /** @description Ligne de la liste des paiements ; le détail (commandes, lignes) se lit sur /manage/receipts/{number}/. */
        ReceiptRow: {
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
            readonly table_number: number | null;
            readonly cashier: string;
            readonly orders_count: number;
        };
        Refuse: {
            reason: string;
        };
        Reorder: {
            level: components["schemas"]["LevelEnum"];
            /** @description Tous les éléments du même parent, dans le nouvel ordre. */
            ids: number[];
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
        /**
         * @description * `manager` - Gérant
         *     * `cashier` - Caisse
         *     * `waiter` - Serveur
         *     * `kitchen` - Cuisine
         * @enum {string}
         */
        RoleEnum: "manager" | "cashier" | "waiter" | "kitchen";
        Sales: {
            /** @description Encaissé sur la période (FCFA). */
            revenue: number;
            receipts_count: number;
            /** @description Commandes passées, hors annulations. */
            orders_count: number;
            cancelled_count: number;
            /** @description Encaissé ÷ nombre de reçus (FCFA). */
            average_ticket: number;
        };
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
        /**
         * @description Compte du personnel vu par le gérant. Le mot de passe ne se lit jamais : il est seulement remis
         *     une fois, en clair, dans la réponse de création ou de réinitialisation (temporary_password).
         */
        StaffCreate: {
            readonly id: number;
            /** @description Identifiant de connexion, mis en minuscules. */
            username: string;
            /** Prénom */
            first_name: string;
            /** Nom */
            last_name?: string;
            readonly name: string;
            /** Téléphone */
            phone?: string;
            /** Rôle */
            role?: components["schemas"]["RoleEnum"];
            readonly role_display: string;
            /**
             * Actif
             * @description Précise si l’utilisateur doit être considéré comme actif. Décochez ceci plutôt que de supprimer le compte.
             */
            is_active?: boolean;
            /** @description Compte propriétaire (superutilisateur) : modifiable par lui seul. */
            readonly is_owner: boolean;
            /**
             * Doit changer son mot de passe
             * @description Mis à vrai quand le gérant crée le compte ou donne un mot de passe provisoire.
             */
            readonly must_change_password: boolean;
            /**
             * Dernière connexion
             * Format: date-time
             */
            readonly last_login: string | null;
            /**
             * Date d’inscription
             * Format: date-time
             */
            readonly date_joined: string;
            /** @description Facultatif : sans mot de passe, un mot de passe provisoire est généré. */
            password?: string;
        };
        /** @description Réponse de création ou de réinitialisation : le compte et, une seule fois, son mot de passe provisoire. */
        StaffCredentials: {
            readonly id: number;
            /** @description Identifiant de connexion, mis en minuscules. */
            username: string;
            /** Prénom */
            first_name?: string;
            /** Nom */
            last_name?: string;
            readonly name: string;
            /** Téléphone */
            phone?: string;
            /** Rôle */
            role?: components["schemas"]["RoleEnum"];
            readonly role_display: string;
            /**
             * Actif
             * @description Précise si l’utilisateur doit être considéré comme actif. Décochez ceci plutôt que de supprimer le compte.
             */
            is_active?: boolean;
            /** @description Compte propriétaire (superutilisateur) : modifiable par lui seul. */
            readonly is_owner: boolean;
            /**
             * Doit changer son mot de passe
             * @description Mis à vrai quand le gérant crée le compte ou donne un mot de passe provisoire.
             */
            readonly must_change_password: boolean;
            /**
             * Dernière connexion
             * Format: date-time
             */
            readonly last_login: string | null;
            /**
             * Date d’inscription
             * Format: date-time
             */
            readonly date_joined: string;
            /** @description À transmettre à la personne ; il ne sera plus jamais affiché. */
            readonly temporary_password: string | null;
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
        /**
         * @description Compte du personnel vu par le gérant. Le mot de passe ne se lit jamais : il est seulement remis
         *     une fois, en clair, dans la réponse de création ou de réinitialisation (temporary_password).
         */
        StaffMember: {
            readonly id: number;
            /** @description Identifiant de connexion, mis en minuscules. */
            username: string;
            /** Prénom */
            first_name?: string;
            /** Nom */
            last_name?: string;
            readonly name: string;
            /** Téléphone */
            phone?: string;
            /** Rôle */
            role?: components["schemas"]["RoleEnum"];
            readonly role_display: string;
            /**
             * Actif
             * @description Précise si l’utilisateur doit être considéré comme actif. Décochez ceci plutôt que de supprimer le compte.
             */
            is_active?: boolean;
            /** @description Compte propriétaire (superutilisateur) : modifiable par lui seul. */
            readonly is_owner: boolean;
            /**
             * Doit changer son mot de passe
             * @description Mis à vrai quand le gérant crée le compte ou donne un mot de passe provisoire.
             */
            readonly must_change_password: boolean;
            /**
             * Dernière connexion
             * Format: date-time
             */
            readonly last_login: string | null;
            /**
             * Date d’inscription
             * Format: date-time
             */
            readonly date_joined: string;
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
        /** @description Création d'un lot de tables : numéros first, first+1… dans la même zone. */
        TableRange: {
            /** @description Numéro de la première table. */
            first: number;
            /** @description Nombre de tables à créer. */
            count: number;
            zone: number;
            /** @default 4 */
            seats: number;
            /** @default true */
            is_active: boolean;
        };
        /**
         * @description * `open` - Ouverte
         *     * `bill_requested` - Addition demandée
         *     * `closed` - Fermée
         * @enum {string}
         */
        TableSessionStatusEnum: "open" | "bill_requested" | "closed";
        ToCollect: {
            total: number;
            tables: components["schemas"]["UnpaidTable"][];
        };
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
        TopDish: {
            dish_id: number;
            dish_name: string;
            quantity: number;
            revenue: number;
        };
        TrendDay: {
            /** Format: date */
            date: string;
            revenue: number;
            orders_count: number;
        };
        /**
         * @description * `day` - day
         *     * `week` - week
         * @enum {string}
         */
        TrendUnitEnum: "day" | "week";
        UnpaidTable: {
            /** @description Vide pour les commandes au comptoir. */
            table_number: number | null;
            total: number;
            orders_count: number;
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
    api_v1_auth_password_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordChange"];
                "application/x-www-form-urlencoded": components["schemas"]["PasswordChange"];
                "multipart/form-data": components["schemas"]["PasswordChange"];
            };
        };
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
    api_v1_manage_dashboard_retrieve: {
        parameters: {
            query?: {
                /** @description Dates libres : dernier jour compris (AAAA-MM-JJ). */
                end?: string;
                /** @description today (défaut), week (7 jours) ou month (30 jours). */
                period?: "month" | "today" | "week";
                /** @description Dates libres : premier jour (AAAA-MM-JJ), avec end ; remplace period. */
                start?: string;
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
                    "application/json": components["schemas"]["Dashboard"];
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
    api_v1_manage_menu_list: {
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
                    "application/json": components["schemas"]["ManageCategory"][];
                };
            };
        };
    };
    api_v1_manage_menu_categories_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ManageCategory"];
                "application/x-www-form-urlencoded": components["schemas"]["ManageCategory"];
                "multipart/form-data": components["schemas"]["ManageCategory"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ManageCategory"];
                };
            };
        };
    };
    api_v1_manage_menu_categories_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this catégorie. */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ManageCategory"];
                "application/x-www-form-urlencoded": components["schemas"]["ManageCategory"];
                "multipart/form-data": components["schemas"]["ManageCategory"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ManageCategory"];
                };
            };
        };
    };
    api_v1_manage_menu_categories_destroy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this catégorie. */
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
    api_v1_manage_menu_categories_partial_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this catégorie. */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["PatchedManageCategory"];
                "application/x-www-form-urlencoded": components["schemas"]["PatchedManageCategory"];
                "multipart/form-data": components["schemas"]["PatchedManageCategory"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ManageCategory"];
                };
            };
        };
    };
    api_v1_manage_menu_dishes_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ManageDish"];
                "application/x-www-form-urlencoded": components["schemas"]["ManageDish"];
                "multipart/form-data": components["schemas"]["ManageDish"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ManageDish"];
                };
            };
        };
    };
    api_v1_manage_menu_dishes_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this plat. */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ManageDish"];
                "application/x-www-form-urlencoded": components["schemas"]["ManageDish"];
                "multipart/form-data": components["schemas"]["ManageDish"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ManageDish"];
                };
            };
        };
    };
    api_v1_manage_menu_dishes_destroy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this plat. */
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
    api_v1_manage_menu_dishes_partial_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this plat. */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["PatchedManageDish"];
                "application/x-www-form-urlencoded": components["schemas"]["PatchedManageDish"];
                "multipart/form-data": components["schemas"]["PatchedManageDish"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ManageDish"];
                };
            };
        };
    };
    api_v1_manage_menu_dishes_photo_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this plat. */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Photo"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ManageDish"];
                };
            };
        };
    };
    api_v1_manage_menu_dishes_photo_destroy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this plat. */
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
    api_v1_manage_menu_reorder_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Reorder"];
                "application/x-www-form-urlencoded": components["schemas"]["Reorder"];
                "multipart/form-data": components["schemas"]["Reorder"];
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
    api_v1_manage_menu_subcategories_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ManageSubCategory"];
                "application/x-www-form-urlencoded": components["schemas"]["ManageSubCategory"];
                "multipart/form-data": components["schemas"]["ManageSubCategory"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ManageSubCategory"];
                };
            };
        };
    };
    api_v1_manage_menu_subcategories_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this sous-catégorie. */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ManageSubCategory"];
                "application/x-www-form-urlencoded": components["schemas"]["ManageSubCategory"];
                "multipart/form-data": components["schemas"]["ManageSubCategory"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ManageSubCategory"];
                };
            };
        };
    };
    api_v1_manage_menu_subcategories_destroy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this sous-catégorie. */
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
    api_v1_manage_menu_subcategories_partial_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this sous-catégorie. */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["PatchedManageSubCategory"];
                "application/x-www-form-urlencoded": components["schemas"]["PatchedManageSubCategory"];
                "multipart/form-data": components["schemas"]["PatchedManageSubCategory"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ManageSubCategory"];
                };
            };
        };
    };
    api_v1_manage_menu_subcategories_photo_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this sous-catégorie. */
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Photo"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ManageSubCategory"];
                };
            };
        };
    };
    api_v1_manage_menu_subcategories_photo_destroy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this sous-catégorie. */
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
    api_v1_manage_payments_retrieve: {
        parameters: {
            query?: {
                /** @description Jour voulu (AAAA-MM-JJ), aujourd'hui par défaut. */
                date?: string;
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
                    "application/json": components["schemas"]["Payments"];
                };
            };
        };
    };
    api_v1_manage_push_retrieve: {
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
                    "application/json": components["schemas"]["PushConfig"];
                };
            };
        };
    };
    api_v1_manage_push_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PushSubscription"];
                "application/x-www-form-urlencoded": components["schemas"]["PushSubscription"];
                "multipart/form-data": components["schemas"]["PushSubscription"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PushConfig"];
                };
            };
        };
    };
    api_v1_manage_push_remove_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PushEndpoint"];
                "application/x-www-form-urlencoded": components["schemas"]["PushEndpoint"];
                "multipart/form-data": components["schemas"]["PushEndpoint"];
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
    api_v1_manage_push_test_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No response body */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
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
    "api_v1_manage_reports_activity.pdf_retrieve": {
        parameters: {
            query?: {
                /** @description Dates libres : dernier jour compris (AAAA-MM-JJ). */
                end?: string;
                /** @description today (défaut), week (7 jours) ou month (30 jours). */
                period?: "month" | "today" | "week";
                /** @description Dates libres : premier jour (AAAA-MM-JJ), avec end ; remplace period. */
                start?: string;
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
    "api_v1_manage_reports_closing.pdf_retrieve": {
        parameters: {
            query?: {
                /** @description Jour voulu (AAAA-MM-JJ), aujourd'hui par défaut. */
                date?: string;
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
    "api_v1_manage_reports_sales.pdf_retrieve": {
        parameters: {
            query?: {
                /** @description Dates libres : dernier jour compris (AAAA-MM-JJ). */
                end?: string;
                /** @description today (défaut), week (7 jours) ou month (30 jours). */
                period?: "month" | "today" | "week";
                /** @description Dates libres : premier jour (AAAA-MM-JJ), avec end ; remplace period. */
                start?: string;
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
    api_v1_manage_staff_list: {
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
                    "application/json": components["schemas"]["StaffMember"][];
                };
            };
        };
    };
    api_v1_manage_staff_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StaffCreate"];
                "application/x-www-form-urlencoded": components["schemas"]["StaffCreate"];
                "multipart/form-data": components["schemas"]["StaffCreate"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StaffCredentials"];
                };
            };
        };
    };
    api_v1_manage_staff_partial_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this membre du personnel. */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["PatchedStaffMember"];
                "application/x-www-form-urlencoded": components["schemas"]["PatchedStaffMember"];
                "multipart/form-data": components["schemas"]["PatchedStaffMember"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StaffMember"];
                };
            };
        };
    };
    api_v1_manage_staff_reset_password_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique integer value identifying this membre du personnel. */
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
                    "application/json": components["schemas"]["StaffCredentials"];
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
    api_v1_manage_tables_bulk_create: {
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
        requestBody: {
            content: {
                "application/json": components["schemas"]["TableRange"];
                "application/x-www-form-urlencoded": components["schemas"]["TableRange"];
                "multipart/form-data": components["schemas"]["TableRange"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Table"][];
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
    api_v1_table_push_retrieve: {
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
                    "application/json": components["schemas"]["PushConfig"];
                };
            };
        };
    };
    api_v1_table_push_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PushSubscription"];
                "application/x-www-form-urlencoded": components["schemas"]["PushSubscription"];
                "multipart/form-data": components["schemas"]["PushSubscription"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PushConfig"];
                };
            };
        };
    };
    api_v1_table_push_remove_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PushEndpoint"];
                "application/x-www-form-urlencoded": components["schemas"]["PushEndpoint"];
                "multipart/form-data": components["schemas"]["PushEndpoint"];
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
