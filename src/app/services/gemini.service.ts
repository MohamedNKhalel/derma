import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  constructor(private http: HttpClient) {}

  private apiKey = "AIzaSyB9on_alHeKPrEd4hKoV-26OuSH9F96Z0Y";
  private context: any[] = [];

  generateContent(prompt: string): Observable<any> {
    this.context.push({
      role: 'user',
      parts: [{ text: prompt }]
    });


    // This endpoint is confirmed to work
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${this.apiKey}`;

    const body = {
      contents: this.context,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    return this.http.post<any>(url, body, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  addAssistantResponse(response: string): void {
    this.context.push({
      role: 'model',
      parts: [{ text: response }]
    });
  }

  clearContext(): void {
    this.context = [];
  }

  getContext(): any[] {
    return this.context;
  }
}