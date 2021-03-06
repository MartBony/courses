<?php

function generateRandomString($length = 30) {
	/* $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$charactersLength = strlen($characters);
	$randomString = '';
	for ($i = 0; $i < $length; $i++) {
		$randomString .= $characters[rand(0, $charactersLength - 1)];
	}
	return $randomString; */
	return substr(bin2hex(random_bytes($length)) . "1111111111", 0, $length);
}

function hashPassword($password){
	return password_hash(
		base64_encode(
			hash('sha384', $password, true)
		),
		PASSWORD_BCRYPT
	);
}

function verifyPassword($input, $storedHash){
	return password_verify(base64_encode(hash('sha384', $input, true)), $storedHash);
}

function getSelector($tokenValidator, $selectorLength = 12){
	return substr($tokenValidator, 0, $selectorLength);
}

function generateToken($validity = 10, $selectorLength = 12, $validatorLength = 40){
	$selector = generateRandomString($selectorLength);
	$validator = $selector . generateRandomString($validatorLength-$selectorLength);
	$hashedValidator = hashPassword($validator);
	return array(
		'selector' => $selector,
		'validator' => $validator,
		'hashedValidator' => $hashedValidator,
		'expires' => time() + 60*60*24*$validity
	);
}

?>