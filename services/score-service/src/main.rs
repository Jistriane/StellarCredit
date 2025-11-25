use actix_web::{get, web, App, HttpResponse, HttpServer, Responder, middleware};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use std::env;
use log::{info, error};

#[derive(Serialize, Deserialize, Clone)]
struct CreditScore {
    address: String,
    score: u16, // 300-850
    confidence: f32, // 0.0-1.0
    risk_tier: String,
    timestamp: i64,
}

#[derive(Serialize, Deserialize)]
struct Factor {
    name: String,
    value: String,
    weight: f32,
}

#[get("/api/v1/score/{address}")]
async fn get_score(path: web::Path<String>) -> impl Responder {
    let address = path.into_inner();
    info!("Calculating score for address: {}", address);

    // 1. Check Cache (Redis) - Mocked for now
    // let cached = redis_client.get(&address).await;
    // if let Some(score) = cached { return HttpResponse::Ok().json(score); }

    // 2. Fetch On-Chain Data (Horizon) - Mocked
    // let txs = fetch_transactions(&address).await;

    // 3. Calculate Score (Mock Logic)
    // Simple deterministic mock based on address hash
    let score = calculate_mock_score(&address);
    
    let response = CreditScore {
        address: address.clone(),
        score: score,
        confidence: 0.95,
        risk_tier: get_risk_tier(score),
        timestamp: chrono::Utc::now().timestamp(),
    };

    HttpResponse::Ok().json(response)
}

fn calculate_mock_score(address: &str) -> u16 {
    let hash = address.bytes().fold(0u16, |acc, x| acc.wrapping_add(x as u16));
    300 + (hash % 551) // Ensure range 300-850
}

fn get_risk_tier(score: u16) -> String {
    match score {
        750..=850 => "Prime".to_string(),
        650..=749 => "Near Prime".to_string(),
        _ => "Subprime".to_string(),
    }
}

#[get("/health")]
async fn health_check() -> impl Responder {
    HttpResponse::Ok().body("OK")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    dotenv::dotenv().ok();

    let port = env::var("PORT").unwrap_or("8080".to_string());
    info!("Starting Score Service on port {}", port);

    HttpServer::new(|| {
        let cors = Cors::permissive();
        App::new()
            .wrap(cors)
            .service(get_score)
            .service(health_check)
    })
    .bind(format!("0.0.0.0:{}", port))?
    .run()
    .await
}
