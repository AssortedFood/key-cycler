# Key Cycler

Key Cycler is a TypeScript utility package designed to help you efficiently manage and cycle through multiple API keys for services with restrictive or expensive rate limits. It enables you to seamlessly rotate keys when making requests to APIs, helping you maximize usage within free or low-cost tiers.

## Overview

Many APIs have rate limits or usage tiers that can be difficult to navigate economically. With Key Cycler, you can provide multiple API keys per service, and it will automatically rotate the keys for each request, handling retries and fallback if a key is exhausted or rate limited.

This package serves as a lightweight wrapper around SDKs or HTTP clients like Axios, abstracting the key management logic in one place.

## Environment Variable Setup

To use Key Cycler, you load your API keys into environment variables following a predictable naming pattern. For example, for two different APIs such as **11 Labs** and **Play HT**, you could set:

```
ENV_11LABS_KEY1=your_11labs_key_1
ENV_11LABS_KEY2=your_11labs_key_2
ENV_PLAYHT_KEY1=your_playht_key_1
ENV_PLAYHT_KEY2=your_playht_key_2
```

The utility will load the keys for each API from environment variables prefixed by `ENV_<API_NAME>_KEY` and manage cycling through them.

## Usage

Key Cycler exposes a generic interface for wrapping your API requests. For each request made using the provided wrapper, the tool automatically:

- Uses the next available API key in the list.
- Detects if a key is exhausted or rate limited and skips it.
- Retries with another key if needed.

This keeps your request flow seamless and transparent.

At this stage, the usage is generic and can be integrated easily with any SDK or HTTP client like Axios.

## Development

Currently, the core focus is on implementing efficient key rotation and retry logic. Future expansions may include:

- Advanced rate limit detection.
- More SDK-specific helpers or plugins.
- Improved environment variable formats or configuration methods.

## License

This project is open source. Please see the LICENSE file for details.

## Contributing

Contributions are welcome! Feel free to open issues or pull requests.
