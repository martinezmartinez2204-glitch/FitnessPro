# FitnessPro

Fitness-Tracking-App zum Planen und Verwalten von Trainingseinheiten mit Gewicht, Wiederholungen, Notizen und Fortschrittsanzeige.

## Im Browser starten

`index.html` kann direkt im Browser geöffnet werden. Trainingsdaten werden lokal im Browser gespeichert.

## iOS-App bauen

Die Web-App wird mit Capacitor als native iOS-App gebündelt. Die Daten bleiben lokal auf dem Gerät; die App benötigt für ihre Kernfunktionen keine Internetverbindung.

Voraussetzungen: macOS, Xcode, Node.js und npm.

```sh
npm install
npm run ios:open
```

In Xcode das Team für die Codesignierung auswählen und bei Bedarf die Bundle-ID `com.fitnesspro.app` anpassen. Danach kann die App für Tests auf einem iPhone ausgeführt oder mit **Product > Archive** für App Store Connect archiviert werden.

Die App-Einreichung erfordert ein Apple-Developer-Konto sowie App-Store-Metadaten und eine ausgefüllte Datenschutzangabe. Die technische Vorbereitung garantiert keine Freigabe durch Apples App Review.
