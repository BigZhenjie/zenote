use serde::{Serialize, Deserialize, Serializer, Deserializer};

#[derive(Debug, Copy, Clone)]
pub enum StatusCode {
    Ok = 200,
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    InternalServerError = 500,
}

impl Serialize for StatusCode {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_u16(*self as u16)
    }
}

impl<'de> Deserialize<'de> for StatusCode {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let value = u16::deserialize(deserializer)?;
        match value {
            200 => Ok(StatusCode::Ok),
            400 => Ok(StatusCode::BadRequest),
            401 => Ok(StatusCode::Unauthorized),
            404 => Ok(StatusCode::NotFound),
            500 => Ok(StatusCode::InternalServerError),
            _ => Err(serde::de::Error::custom("Invalid status code")),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Response<T = serde_json::Value> {
    pub status: StatusCode,
    pub data: Option<T>,
    pub error: Option<String>,
}
