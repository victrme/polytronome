import Settings from '../types/settings'
import Themes from '../assets/themes.json'

type UpdateMoreSettings = {
	moreSettings: Settings
	cat: keyof Settings
	theme?: number
}

export default function updateMoreSettings({ moreSettings, cat, theme }: UpdateMoreSettings) {
	//

	switch (cat) {
		case 'easy':
			moreSettings.easy = !moreSettings.easy
			break

		case 'animations':
			moreSettings.animations = !moreSettings.animations
			break

		case 'theme':
			moreSettings.theme = isNaN(theme) ? (moreSettings.theme + 1) % Themes.length : theme
			break

		case 'clickType':
			moreSettings.clickType = (moreSettings.clickType + 1) % 3
			break

		case 'offset':
			moreSettings.offset = (moreSettings.offset + 50) % 550
			break
	}

	return moreSettings
}
