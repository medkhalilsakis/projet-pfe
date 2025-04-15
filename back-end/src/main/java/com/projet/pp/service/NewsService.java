package com.projet.pp.service;

import com.projet.pp.dto.NewsResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class NewsService {

    private final WebClient webClient;

    public NewsService(WebClient.Builder webClientBuilder) {
        // On se connecte à l’URL de base de News API
        this.webClient = webClientBuilder.baseUrl("https://newsapi.org/v2").build();
    }

    public Mono<NewsResponse> getTechNews() {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/top-headlines")
                        .queryParam("apiKey", "4857493bdd3c407ca1afb805c056e6d2")
                        .queryParam("category", "technology")
                        // Vous pouvez ajouter par exemple country si besoin : .queryParam("country", "fr")
                        .build())
                .retrieve()
                .bodyToMono(NewsResponse.class);
    }
}

