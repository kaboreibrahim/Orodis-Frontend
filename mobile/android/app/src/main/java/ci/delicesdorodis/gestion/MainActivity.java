package ci.delicesdorodis.gestion;

import android.app.DownloadManager;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

/**
 * Espace du personnel des Délices d'Orodis.
 * Capacitor ouvre /gestion du site en ligne ; cette activité ajoute ce qu'un navigateur fait seul :
 * - l'écran reste allumé (écran cuisine, caisse) ;
 * - le bouton retour revient à la page précédente au lieu de fermer l'application ;
 * - window.print() ouvre l'impression Android (tickets 80 mm, chevalets) ;
 * - les PDF (reçus, planche de QR codes) sont téléchargés avec la session du personnel.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(new OrodisAndroid(), "OrodisAndroid");
        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) ->
            download(url, userAgent, contentDisposition, mimeType));

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView view = getBridge().getWebView();
                if (view.canGoBack()) {
                    view.goBack();
                } else {
                    // L'application passe en arrière-plan sans se fermer : les commandes continuent d'arriver au retour.
                    moveTaskToBack(true);
                }
            }
        });
    }

    /** Reçus et planches de QR codes : téléchargés dans « Téléchargements », ouverts depuis la notification. */
    private void download(String url, String userAgent, String contentDisposition, String mimeType) {
        try {
            String fileName = URLUtil.guessFileName(url, contentDisposition, mimeType);
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url))
                .setMimeType(mimeType)
                .addRequestHeader("User-Agent", userAgent)
                .setTitle(fileName)
                .setDescription("Les Délices d’Orodis")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
            } else {
                // Android 9 et moins : dossier de l'application, sans demander l'accès au stockage.
                request.setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, fileName);
            }
            // Les fichiers passent par le relais /api/gestion : la session du personnel est dans les cookies.
            String cookies = CookieManager.getInstance().getCookie(url);
            if (cookies != null) {
                request.addRequestHeader("Cookie", cookies);
            }
            DownloadManager manager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            manager.enqueue(request);
            Toast.makeText(this, "Téléchargement de " + fileName + "…", Toast.LENGTH_SHORT).show();
        } catch (Exception error) {
            Toast.makeText(this, "Le fichier n’a pas pu être téléchargé.", Toast.LENGTH_LONG).show();
        }
    }

    /** Appelé par le site : window.OrodisAndroid.print(titre) et window.OrodisAndroid.retry(). */
    private class OrodisAndroid {

        @JavascriptInterface
        public void print(String title) {
            runOnUiThread(() -> {
                String jobName = (title == null || title.isEmpty()) ? "Les Délices d’Orodis" : title;
                PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                PrintDocumentAdapter adapter = getBridge().getWebView().createPrintDocumentAdapter(jobName);
                printManager.print(jobName, adapter, new PrintAttributes.Builder().build());
            });
        }

        /** Page hors ligne : nouvel essai sur l'adresse du site configurée dans capacitor.config.ts. */
        @JavascriptInterface
        public void retry() {
            runOnUiThread(() -> getBridge().getWebView().loadUrl(getBridge().getServerUrl()));
        }
    }
}
