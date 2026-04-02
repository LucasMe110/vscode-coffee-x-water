# Coffee x Water

A fun VS Code extension that tracks your coffee and water intake throughout the day. Drink too much coffee without enough water? Your kidney will let you know!

## Features

### Drink Counter
Track every cup of coffee and glass of water right from the Explorer sidebar. No need to leave your editor.

### Kidney Reactions

**Happy Kidney** - When your water intake is greater than coffee, your kidney celebrates with a happy dance and random humorous messages:

> *"Your kidney just sent you a thank-you card!"*
>
> *"Kidney status: living its best life!"*
>
> *"Breaking news: kidney declares today a national holiday!"*

**Kidney in Danger** - When the difference between coffee and water reaches 3 or more, a shaking kidney appears with a warning. Time to hydrate!

### Particle Effects
- Water drops fall when you add water
- Coffee steam rises when you add coffee

### Multi-language Support
Switch between **English** and **Portuguese** instantly using the globe icon in the panel header.

## How to Use

1. Open the **Explorer** sidebar
2. Find the **Coffee x Water** section (collapsible, like Outline or Timeline)
3. Click **Coffee** or **Water** buttons to track your drinks
4. Click **Reset** to start fresh

### Commands

| Command | Description |
|---------|-------------|
| `Coffee x Water: Add Coffee` | Add one coffee to the counter |
| `Coffee x Water: Add Water` | Add one water to the counter |
| `Coffee x Water: Reset Counters` | Reset both counters to zero |
| `Coffee x Water: Change Language` | Switch between English and Portuguese |

All commands are also available via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `cafeXAgua.language` | `en` | Extension language (`en` for English, `pt` for Portuguese) |

## How It Works

| Condition | Kidney State |
|-----------|-------------|
| Water > Coffee | Happy kidney with humorous messages |
| Coffee - Water < 3 | Neutral (no kidney shown) |
| Coffee - Water >= 3 | Kidney in danger! Shaking + warning |

## Installation

### From VS Code Marketplace
Search for **"Coffee x Water"** in the Extensions tab and click Install.

### From VSIX
1. Download the `.vsix` file from [Releases](https://github.com/LucasMe110/vscode-coffee-x-water/releases)
2. In VS Code: `Extensions` > `...` > `Install from VSIX...`

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests on [GitHub](https://github.com/LucasMe110/vscode-coffee-x-water).

## License

[MIT](LICENSE)
