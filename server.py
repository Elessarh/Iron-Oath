#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Serveur HTTP simple avec support UTF-8 correct pour Iron Oath
"""
import http.server
import socketserver
import os

PORT = 8000

class UTF8Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Ajouter les headers UTF-8 pour les fichiers HTML, CSS et JS
        if self.path.endswith('.html'):
            self.send_header('Content-Type', 'text/html; charset=utf-8')
        elif self.path.endswith('.css'):
            self.send_header('Content-Type', 'text/css; charset=utf-8')
        elif self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript; charset=utf-8')
        super().end_headers()

    def guess_type(self, path):
        """Override pour forcer UTF-8"""
        mimetype = super().guess_type(path)
        if mimetype in ['text/html', 'text/css', 'application/javascript']:
            return mimetype + '; charset=utf-8'
        return mimetype

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), UTF8Handler) as httpd:
    print(f"🚀 Serveur Iron Oath démarré sur http://localhost:{PORT}")
    print(f"📁 Dossier: {os.getcwd()}")
    print("Appuyez sur Ctrl+C pour arrêter")
    httpd.serve_forever()
