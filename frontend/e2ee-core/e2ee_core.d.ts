/* tslint:disable */
/* eslint-disable */

export function decrypt_message(combined_b64: string, secret_key_b64: string): string;

export function derive_shared_secret(my_private_key_b64: string, their_public_key_b64: string): string;

export function encrypt_message(message: string, secret_key_b64: string): string;

export function generate_keypair(): string;
