use reqwest::RequestBuilder;
use reqwest::{Client, Response};
use serde_json::Value;
use std::fs::File;
use std::io::Error;
use std::io::Read;

pub async fn send_file_to_endpoint(
    request_builder: RequestBuilder,
    body: &str,
) -> Result<Response, Error> {
    // Read the file contents into a buffer
    let mut file = File::open(body)?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;

    // Create a reqwest Client
    // let client = Client::new();

    // Build the request with the file content in the body
    let response = request_builder.body(buffer).send().await;

    return match response {
        Ok(response) => Ok(response),
        Err(e) => Err(Error::new(
            std::io::ErrorKind::Other,
            format!("Error: {}", e),
        )),
    };
}
