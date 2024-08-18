`rustup override set nightly`

Search user settings in the command pallette with Ctrl + Shift + P
Then add the following entry to the settings
"rust-analyzer.procMacro.ignored": {
"leptos_macro": [
// optional:
// "component",
"server"
],
}
