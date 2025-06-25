{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs_22
    pkgs.python3
    pkgs.pnpm
  ];
}
