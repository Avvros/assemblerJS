'use strict';

var map = {
	'nop': '90',
	'inc al': 'fe c0',
	'inc cl': 'fe c1',
	'inc dl': 'fe c2',
	'inc bl': 'fe c3',
	'inc ah': 'fe c4',
	'inc ch': 'fe c5',
	'inc dh': 'fe c6',
	'inc bh': 'fe c7',
	'inc eax': '40',
	'inc ecx': '41',
	'inc edx': '42',
	'inc ebx': '43',
	'inc ebp': '45',
	'inc esi': '46',
	'inc edi': '47',
	'dec al': 'fe c8',
	'dec cl': 'fe c9',
	'dec dl': 'fe ca',
	'dec bl': 'fe cb',
	'dec ah': 'fe cc',
	'dec ch': 'fe cd',
	'dec dh': 'fe ce',
	'dec bh': 'fe cf',
	'dec eax': '48',
	'dec ecx': '49',
	'dec edx': '4a',
	'dec ebx': '4b',
	'dec ebp': '4d',
	'dec esi': '4e',
	'dec edi': '4f',
	'dec [eax]': 'fe 08',
	'dec [ecx]': 'fe 09',
	'dec [edx]': 'fe 0a',
	'dec [ebx]': 'fe 0b',
	'dec [ebp]': 'fe 0d',
	'dec [esi]': 'fe 0e',
	'dec [edi]': 'fe 0f',
	'neg al': 'f6 d8',
	'neg cl': 'f6 d9',
	'neg dl': 'f6 da',
	'neg bl': 'f6 db',
	'neg ah': 'f6 dc',
	'neg ch': 'f6 dd',
	'neg dh': 'f6 de',
	'neg bh': 'f6 df',
	'neg eax': 'f7 d8',
	'neg ecx': 'f7 d9',
	'neg edx': 'f7 da',
	'neg ebx': 'f7 db',
//	'neg esp': 'f7 dc',
	'neg ebp': 'f7 dd',
	'neg esi': 'f7 de',
	'neg edi': 'f7 df',
}