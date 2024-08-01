const allowedColors = [
	"red", 
	"green", 
	"blue", 
	"yellow", 
	"purple", 
	"orange", 
	"pink", 
	"brown", 
	"white",
	"grey"
];

module.exports = class Validator {
	constructor() { }

	validateUser(user) {
		if (!user || !user.name || !user.color)
			return [false, "Invalid user object"];

		// Check if the username is empty or too long
		if (user.name.length < 1 || user.name.length > 200)
			return [false, "Invalid username"];

		// Check if the password is empty or too long
		if (user.password && (user.password.length < 1 || user.password.length > 200))
			return [false, "Invalid password"];

		// Check if the color is in the allowed colors
		if (!allowedColors.includes(user.color))
			return [false, "Invalid color"]
        
		return [true, null];
	}

	validateMessage(message) {
		// must have a text and date
		if (!message || !message.text || !message || !message.user)
			return [false, "Invalid message object"];
		// Check if the message is empty or too long
		if (message.text.length < 1 || message.text.length > 200)
			return [false, "Invalid message"];

		return [true, null];
	}

	validateChannel(channel) {
		// must have a name
		if (!channel || !channel.name)
			return [false, "Invalid channel object"];
    
		// Check if the channel name is empty or too long
		if (channel.name.length < 1 || channel.name.length > 50)
			return [false, "Invalid channel name"];

		// if channel has password, check if it is too long
		if (channel.password && channel.password.length > 200)
			return [false, "Invalid channel password"];

		return [true, null];
	}
};