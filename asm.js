'use strict';

var registers = {'eax': 0, 'ecx': 1, 'edx': 2, 'ebx': 3, 'ebp': 5, 'esi': 6, 'edi': 7,
				 'ax': 0, 'cx': 1, 'dx': 2, 'bx': 3, 'bp': 5, 'si': 6, 'di': 7,
				 'al': 0, 'cl': 1, 'dl': 2, 'bl': 3, 'ah': 4, 'ch': 5, 'dh': 6, 'bh': 7};


var registersB = {'eax': '000', 'ecx': '001', 'edx': '010', 'ebx': '011', 'ebp': '101', 'esi': '110', 'edi': '111',
				  'ax': '000', 'cx': '001', 'dx': '010', 'bx': '011', 'bp': '101', 'si': '110', 'di': '111',
				  'al': '000', 'cl': '001', 'dl': '010', 'bl': '011', 'ah': '100', 'ch': '101', 'dh': '110', 'bh': '111'};
			  
			  
var bitsize = {'eax': 32, 'ecx': 32, 'edx': 32, 'ebx': 32, 'ebp': 32, 'esi': 32, 'edi': 32,
			   'ax': 16, 'cx': 16, 'dx': 16, 'bx': 16, 'bp': 16, 'si': 16, 'di': 16,
			   'al': 8, 'cl': 8, 'dl': 8, 'bl': 8, 'ah': 8, 'ch': 8, 'dh': 8, 'bh': 8};

var map1 = [
	{reg: /^dec \[(eax|ecx|edx|ebx|ebp|esi|edi)\+([0-9a-fhoq]+)\]$/, num_len: 1, codes: [0xfe, 0x48]}
];

var map_1 = {};

function div(val, by) // в js нету деления нацело. Шок
{
    return (val - val % by) / by;
}

function neg_sB(s)
{
	var s1;
	s1 = '';
	
	for (var i = 0; i < s.length; i++)
		s1 = s1 + (s.charAt(i) == '1' ? '0' : '1');
	
	s = s1;
	s1 = '';
	var p = 1;
	
	for(var i = s.length - 1; i >= 0; i--) {
		var p1 = p * s.charAt(i);
		
		s1 = (+s.charAt(i) && +p || !+s.charAt(i) && !+p ? '0' : '1') + s1;
		
		p = p1;
	}
	
	return s1;
}

function int_to_sB(i, n) // i - число, n - разрядность (8, 16, 32)
{
	if (i < -Math.pow(2, n - 1) || i >= Math.pow(2, n - 1)) 
		return '-';
	
	var s = '';
	var sign = i < 0 ? 1 : 0;
	var i_orig = i;
	
	i = Math.abs(i);
	
	for (var k = 0; k < n - 1; k++){
		
		s = ( i % 2 + '') + s;
		i /= 2; i = i - (i % 1);
		
	}
	
	s = (i_orig == -Math.pow(2, n - 1) ? '1' : '0') + s;
	
	if (sign)
		s = neg_sB(s);
	
	return s;
}


function parse_int(s)
{
	var bases = {'b': 2, 'o': 8, 'q': 8, 'h': 16, 'd': 10};
	
	var base = bases[s[s.length - 1]]; 
	
	if(base == undefined)
		base = 10;
	else
		s = s.substring(0, s.length - 1);
	
	var res = 0;
	var c
	
	for(var i in s){
		if('0' <= s[i] && s[i] <= '9')
			c = s.charCodeAt(i) - 48;
		else if('a' <= s[i] && s[i] <= 'f')
			c = s.charCodeAt(i) - 97 + 10;
		else if(s[i] == ' ')
			return 'В записи числа обнаружен пробел.';
		else
			return 'В записи числа обнаружен недопустимый символ.';
		res *= base;
		if(c >= base)
			return 'В записи числа обнаружена недопустимая цифра.';
		res += c
	}
	
	return res;	
}

function hex(val, bytes = 1)
{
	val = val * 1;
	val = val.toString(16); // преобразует число к 16й системе
	
	while(val.length < bytes * 2)
		val = '0' + val;
	
	return val
}

function to_hex(bin_str) // only multiples of 8
{
	var res = '';
	var slice = '';
	var val;
	
	for (var i = 0; i < bin_str.length - 7; i += 8) {

		slice = bin_str.substring(i, i + 8);
		slice = slice * 1;
		
		val = slice % 2;
		
		for (var j = 1; j < 8; j++) {
			slice = div(slice, 10);
			val += (slice % 2) * Math.pow(2, j);
		}
		
		res = res + hex(val) + ' ';
	}
	
	res = res.substring(0, res.length - 1); // cutting last space
	
	return res;
}

function to_reverse_hex(bin_str) // only multiples of 8
{
	var res = '';
	var slice = '';
	var val;
	
	for (var i = bin_str.length - 8; i >= 0; i -= 8) {

		slice = bin_str.substring(i, i + 8);
		slice = slice * 1;
		
		val = slice % 2;
		
		for (var j = 1; j < 8; j++) {
			slice = div(slice, 10);
			val += (slice % 2) * Math.pow(2, j);
		}
		
		res = res + hex(val) + ' ';
	}
	
	res = res.substring(0, res.length - 1); // cutting last space
	
	return res;
}

function codes_str_TO_codes(codes_str)
{
	var codes = codes_str.split(' ');
	for(var i in codes){
		codes[i] = parseInt(codes[i], 16);
	}
	return codes;
}

function codes_TO_codes_str(codes)
{
	var codes_str = [];
	for(var i in codes){
		codes_str.push(hex(codes[i]));
	}
	return codes_str.join(' ');
}

(function (){
	for(var asm in map){
		var codes = codes_str_TO_codes(map[asm]);
		map[asm] = {codes: codes, codes_str: map[asm]};
		// выворачиваем наизнанку (map_d = map^(-1))
		var el = map_1;
		
		for (var i in codes) {
			if (el[codes[i]] == undefined)
				if (i == codes.length - 1)
					el[codes[i]] = asm;
				else
					el[codes[i]] = {};
			else
				if (typeof el[codes[i]] == 'string')
					console.log('Ошибка обработки map[' + asm + ']');
				
			el = el[codes[i]];
		}		
	}
})();

/*
canonic - привести к каноническому виду: убрать лишние пробелы, оставить один между командой и операндами, и после запятой, отделяющей операнды, остальные убрать, привести к нижнему регистру.
err = '' - нет ошибки

cmd_explode возвращает массив слов - команду и операнды (если они есть)
*/


// MAP GENERATOR

/*for (var reg in registers) {
	for (var reg2 in registers) {
		if (reg != reg2) {
			var cd = asm(40100, 'add ' + reg + ', ' + reg2).codes;
			//console.log(cd);
			console.log("'add " + reg + ', ' + reg2 + "' : '" + codes_TO_codes_str(cd) + "',");
		}
	}
}*/

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function canonic(s)
{
	s = s.replace(/\[/g, ' [').replace(/\[\s+/g, ' [').replace(/\s+\]/g, ']').replace(/\]\s+/g, ']').replace(/\s+\+/g, '+').replace(/\+\s+/g, '+').replace(/,/g, ', ').replace(/\s+/g, ' ').trim().toLowerCase();
	return s;
}

function cmd_explode(cmd_text)
{
	var space = cmd_text.indexOf(' ');
	
	if(space == -1) // checking non-operand command
		return {err: '', cmd: [cmd_text]};
	
	var cmd = [cmd_text.substring(0, space)]
	
	var ops = cmd_text.substring(space + 1).split(', ')
	
	if(ops.length > 2)
		return {err: 'Параметров должно быть не больше двух.'};
	
	return {err: '', cmd: cmd.concat(ops)};
}

function byte_cost(number)
{
	var res = 1;
	var max_num = 127;
	
	while (number % max_num != number) {
		max_num = (max_num + 1) * 256 - 1;
		
		res += 1;
	}
	
	return res;
}


function get_operand(opd_text) // reg, mem or imm
{
	
	if (/^byte/.test(opd_text) || /^dword/.test(opd_text) || /^\[/.test(opd_text)) { // just mem

		var space = opd_text.indexOf(' ');
		var l_sq = opd_text.indexOf('[');
		var r_sq = opd_text.indexOf(']');
		
		
		if (l_sq == -1 || r_sq == -1 || (space == -1 && opd_text[0] != '['))
			return {type: 'err', value: 'Неверный операнд'};
		
		
		if (opd_text[0] != '[') {
			var siz = opd_text.substring(0, space);
			siz = siz == 'byte' ? 8 : 32;
		} else {
			siz = 'depends on other';
		}
		
		
		var addr = opd_text.substring(l_sq + 1, r_sq);
		
		if (addr == '') 
			return {type: 'err', value: 'Неопределенный адрес в памяти'};
		
		addr = addr.replace(/\s/g, '');

		
		// works only with  now (reg, reg + disp, disp)
		var rg = addr.match(/^(eax|ecx|edx|ebx|ebp|esi|edi)/);
		
		if (!rg) {
			// displacement == addr
			
			var sgn = addr.match(/(\+|\-)/);
				
			if (sgn) {
				if (sgn.length != 2 || sgn.index != 0) 
					return {type: 'err', value: 'Неверный адрес'};
				
				addr = addr.substring(1);
				sgn = sgn[0];
			}
			
			var disp = parse_int(addr);
			
			if (typeof disp == "string")
				return {type: 'err', value: disp};
			
			return {type: 'mem', size: siz, adrr: 'disponly', value: (sgn && sgn == '-' ? -disp : disp), mod: '00', r_m: '101'};
			
		} else {
			rg = rg[0]; // make rg just string
			
			// dated    return {type: 'mem', size: siz, adrr: 'reg', value: registers[rg], mod: '00', r_m: registersB[rg]};
			if (addr.length == 3)
				if (rg == 'ebp')
					return {type: 'mem', size: siz, adrr: 'reg+disp', disp_size: 8, dispval: 0, mod: '01', r_m: '101'}; // [ebp] == [ebp+00h]
				else
					return {type: 'mem', size: siz, adrr: 'reg', mod: '00', r_m: registersB[rg]};
			
			if (/(\+|\-)/.test(addr)) { // if here's + or -
				
				var sgn = addr.match(/(\+|\-)/);
				
				if (sgn.length != 2 || sgn.index != 3) 
					return {type: 'err', value: 'Неверный адрес'};
				
				
				var disp = addr.substring(4);
				
				disp = parse_int(disp); // знак учтен при return
				
				if (typeof disp == "string") 
					return {type: 'err', value: disp}
				
				// disp_size сохранен для использования в функции int_to_sB	
				return {type: 'mem', size: siz, adrr: 'reg+disp', disp_size: (disp < 128 ? 8 : 32), dispval: (sgn[0] == '+' ? disp : -disp), mod: (disp < 128 ? '01' : '10'), r_m: registersB[rg]};
				
			} else {
				return {type: 'err', value: 'Неверный адрес'};
			}
		}
		
	} else { // reg or imm or ptr
		if (opd_text.match(/(\[|\]|\s)/))
			return {type: 'err', value: 'Неверный операнд'};
	
	
		var rg = opd_text.match(/^(eax|ecx|edx|ebx|ebp|esi|edi|ax|cx|dx|bx|bp|si|di|ah|al|ch|cl|dh|dl|bh|bl)$/);
		
		if (!rg) { // just imm
			var sgn = opd_text.match(/^(\+|\-)/);
			
			
			if (sgn) {
				sgn = sgn[0];
				
				opd_text = opd_text.substring(1); // число без учета знака
			}
			
			var imm = parse_int(opd_text);
			
			if (typeof imm == "string") 
				return {type: 'err', value: imm};
			
			return {type: 'imm', size: 8 * byte_cost(imm), value: (sgn && sgn == '-' ? -imm : imm)};
			
		} else { // just reg
		
			rg = rg[0]; // make rg just string

			return {type: 'reg', size: bitsize[rg], mod: '11', r_m: registersB[rg]};
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// {err, codes_str, codes, cmd_text}
function asm(address, cmd_text)
{
	// дополнительная функция для укорочения кода.
	var make_ans = function(param) // typeof param == string <=> param === err
	{
		if (typeof param == 'string')
			return {address: address,
					err: param,
					codes: [],
					cmd_text: cmd_text};
		else
			return {address: address,
					err: '',
					codes: param,
					cmd_text: cmd_text};
	};
	
	
	
	cmd_text = canonic(cmd_text); 


	/*if(map[cmd_text] != undefined) 
		return {address: address, 
				err: '',
				codes: map[cmd_text].codes, 
				cmd_text: cmd_text}; */
	
		
	var cmd_shapes = cmd_explode(cmd_text);
	
	
	if(cmd_shapes.err != '') // если в структуре есть ошибка, или  > 2 аргумента
		return make_ans(cmd_shapes.err);

	cmd_shapes = cmd_shapes.cmd; // убирает err, теперь cmd_shapes = ['<command>', <operands>]
	
	switch (cmd_shapes[0]) 
	{
		case 'nop': //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			if (cmd_shapes.length != 1) 
				return make_ans("У команды 'nop' нету операндов");
				
			return make_ans([0x90]);
		break;      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		case 'db':	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			if (cmd_shapes.length > 2)
				return make_ans("У команды 'db' лишь один операнд");
			
			var op = get_operand(cmd_shapes[1]);
			
//console.log(op);
			
			if (op.type == 'err')
				return make_ans(op.value);
			else if (op.type == 'imm')
				if (op.value > 255) // op.size - сколько байт надо, для ЗНАКОВОЙ записи
					return make_ans("Операнд 'db' может быть размером только 1 байт");
				else
					return make_ans([codes_str_TO_codes(hex(op.value))]);
			else 
				return make_ans("Операндом 'db' может быть только константа");
		break;		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		case 'add':	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
			if (cmd_shapes.length != 3)
				return make_ans("У команды 'add' 2 операнда");
			
			var op1 = get_operand(cmd_shapes[1]);
			var op2 = get_operand(cmd_shapes[2]);
			
			
			if (op1.type == 'err')
				return make_ans(op1.value);
			
			if (op2.type == 'err')
				return make_ans(op2.value);
			
//console.log(op1);
//console.log(op2);
			
			var native_codeB = '000000';
			
			
			switch (op1.type) 
			{
				case 'imm':
					return make_ans("У команды 'add' не может быть 1м операндом константа");
				break;
				
				case 'reg':
					if (op2.type != 'imm' && typeof op2.size != 'string' && op1.size != op2.size)
						return make_ans("Размеры операндов не равны");
					
					
					native_codeB += '0' + (op1.size == 8 ? '0' : '1'); // just 0 - fiction d bit, it'll be changed in next code
				
				
					if (op1.value == 0 && (op1.size == 8 || op1.size == 16 || op1.size == 32) && op2.type == 'imm') {
						native_codeB = '0000010';
						
						native_codeB += (op1.size == 8 ? '0' : '1');
						
						return make_ans(codes_str_TO_codes(to_hex(native_codeB) + ' ' + to_reverse_hex(int_to_sB(op2.value, op1.size))));
					}
					
					
					switch (op2.type)
					{
						case 'reg':
							return make_ans(codes_str_TO_codes(to_hex(native_codeB + op2.mod + op2.r_m + op1.r_m)));
						break;
						
						case 'mem': 
							native_codeB = native_codeB.substring(0, 6) + '1' + native_codeB.substring(7); //native_codeB[6] = '1'; - changing direction bit


							switch (op2.adrr) {
								case 'reg': // [reg]  in R/M
									return make_ans(codes_str_TO_codes(to_hex(native_codeB + op2.mod + op1.r_m + op2.r_m)));
								break;
								
								case 'disponly':
									return make_ans(codes_str_TO_codes(to_hex(native_codeB + op2.mod + op1.r_m + op2.r_m) + ' ' + to_reverse_hex(int_to_sB(op2.value, 32))));
								break;
								
								case 'reg+disp':
									return make_ans(codes_str_TO_codes(to_hex(native_codeB + op2.mod + op1.r_m + op2.r_m) + ' ' + to_reverse_hex(int_to_sB(op2.dispval, op2.disp_size))));
								break;
							}
						break;
						
						case 'imm': // REG == 000, opcode = 100000sw, s == 0 => size as 1st oper, else - size 8 bit. w == 0 - opers are 1 byte
							if (op1.size < op2.size)
								return make_ans("Число больше размера ячейки");
							
							native_codeB = '100000';
							
							
							if (op1.size > op2.size && op2.size == 8)
								native_codeB += '1';
							else 
								native_codeB += '0';
							
							native_codeB += (op1.size == 8 ? '0' : '1');

							return make_ans(codes_str_TO_codes(to_hex(native_codeB + '11000' + op1.r_m) + ' ' + to_reverse_hex(int_to_sB(op2.value, (op1.size > op2.size && op2.size == 8 ? 8 : op1.size)))));
							
						break;
					}
				break;
				
				case 'mem':
					switch (op2.type)
					{
						case 'mem':
							return make_ans("У команды 'add' не может быть 2 операнда из памяти");
						break;
						
						case 'reg':
							if (typeof op1.size != 'string' && op1.size != op2.size)
								return make_ans("Размеры операндов не равны");
							
							if (typeof op1.size == 'string')
								op1.size = op2.size;
								
							native_codeB += '0' + (op1.size == 8 ? '0' : '1');
							
							switch (op1.adrr)
							{
								case 'reg':
									return make_ans(codes_str_TO_codes(to_hex(native_codeB + op1.mod + op2.r_m + op1.r_m)));
								break;
								
								case 'disponly':
									return make_ans(codes_str_TO_codes(to_hex(native_codeB + op1.mod + op2.r_m + op1.r_m) + ' ' + to_reverse_hex(int_to_sB(op1.value, 32))));
								break;
								
								case 'reg+disp':
									return make_ans(codes_str_TO_codes(to_hex(native_codeB + op1.mod + op2.r_m + op1.r_m) + ' ' + to_reverse_hex(int_to_sB(op1.dispval, op1.disp_size))));
								break;
							}
						break;
						
						case 'imm': // REG == 000, opcode = 100000sw, s == 0 => size as 1st oper, else - size 8 bit. w == 0 - opers are 1 byte
						
							native_codeB = '100000';
						
							if (typeof op1.size == 'string') {
								if (op2.size == 16) 
									op1.size = 32;
								else
									op1.size = op2.size;
								
								native_codeB += '0';
							} else {
								if (op1.size < op2.size)
									return make_ans("Размеры операндов не равны");
								
								if (op1.size > op2.size && op2.size == 8)
									native_codeB += '1';
								else 
									native_codeB += '0';
							}
							
							native_codeB += (op1.size == 8 ? '0' : '1');
							
							switch (op1.adrr)
							{
								case 'reg': 
									return make_ans(codes_str_TO_codes(to_hex(native_codeB + op1.mod + '000' + op1.r_m) + ' ' + to_reverse_hex(int_to_sB(op2.value, (op2.size == 8 ? 8 : 32)))));
								break;
								
								case 'disponly':
									return make_ans(codes_str_TO_codes(to_hex(native_codeB + op1.mod + '000' + op1.r_m) + ' ' + to_reverse_hex(int_to_sB(op2.size == 8 ? 8 : 32))));
								break;
								
								case 'reg+disp':
									return make_ans(codes_str_TO_codes(to_hex(native_codeB + op1.mod + '000' + op1.r_m) + ' ' + to_reverse_hex(int_to_sB(op1.dispval, op1.disp_size)) + ' ' + to_reverse_hex(int_to_sB(op2.value, (op2.size == 8 ? 8 : 32)))));
								break;
							}
						break;
					}
				break;
			}
		break;		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		case 'sub':
		break;
		
		case 'cmp':
		break;
		
		case 'inc':	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		case 'dec':
			if (cmd_shapes.length > 2)
				return make_ans("У команды '" + cmd_shapes[0] + "'лишь один операнд");
			
			var op = get_operand(cmd_shapes[1]);
			
			if (op.type == 'err')
				return make_ans(op.value);
			else if (op.type == 'imm')
				return make_ans("Операндом '" + cmd_shapes[0] + "' не может быть константа");
				
//console.log(op);
			
			var native_codeB = '0100';
			
			native_codeB += (cmd_shapes[0] == 'inc' ? '0' : '1');
			
			var reg_value = (cmd_shapes[0] == 'inc' ? '000' : '001');
			
			if (op.type == 'reg') {
				if (op.size == 8)
					return make_ans(codes_str_TO_codes(to_hex('11111110' + op.mod + reg_value + op.r_m)));
				else
					return make_ans(codes_str_TO_codes(to_hex(native_codeB + op.r_m)));
			} else {
				if (typeof op.size == 'string')
					return make_ans("У операнда неопределенный размер");
				
				if (op.size == 8)
					native_codeB = '11111110';
				else
					native_codeB = '11111111';
				
				switch (op.adrr) 
				{
					case 'reg':
						return make_ans(codes_str_TO_codes(to_hex(native_codeB + op.mod + reg_value + op.r_m)));
					break;
					
					case 'disponly':
						return make_ans(codes_str_TO_codes(to_hex(native_codeB + op.mod + reg_value + op.r_m) + ' ' + to_reverse_hex(int_to_sB(op.value, 32))));
					break;
					
					case 'reg+disp':
						return make_ans(codes_str_TO_codes(to_hex(native_codeB + op.mod + reg_value + op.r_m) + ' ' + to_reverse_hex(int_to_sB(op.dispval, op.disp_size))));
					break;
				}
			}
		break;		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		case 'neg':	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			if (cmd_shapes.length > 2)
				return make_ans("У команды 'neg' лишь один операнд");
			
			var op = get_operand(cmd_shapes[1]);
			
			if (op.type == 'err')
				return make_ans(op.value);
			else if (op.type == 'imm')
				return make_ans("Операндом 'neg' не может быть константа");
			
//console.log(op);
			
			var native_codeB = '1111011';
			
			if (op.type == 'reg') {
				if (op.size == 8)
					native_codeB += '0';
				else
					native_codeB += '1';
				
				return make_ans(codes_str_TO_codes(to_hex(native_codeB + op.mod + '011' + op.r_m)));
			} else {
				if (typeof op.size == 'string')
					return make_ans("У операнда неопределенный размер");
				
				if (op.size == 8)
					native_codeB += '0';
				else
					native_codeB += '1';
				
				switch (op.adrr) 
				{
					case 'reg':
						return make_ans(codes_str_TO_codes(to_hex(native_codeB + op.mod + '011' + op.r_m)));
					break;
					
					case 'disponly':
						return make_ans(codes_str_TO_codes(to_hex(native_codeB + op.mod + '011' + op.r_m) + ' ' + to_reverse_hex(int_to_sB(op.value, 32))));
					break;
					
					case 'reg+disp':
						return make_ans(codes_str_TO_codes(to_hex(native_codeB + op.mod + '011' + op.r_m) + ' ' + to_reverse_hex(int_to_sB(op.dispval, op.disp_size))));
					break;
				}
			}
		break;		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		case 'push'://////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		case 'pop':
		
			if (cmd_shapes.length > 2)
				return make_ans("У команды '" + cmd_shapes[0] + "'лишь один операнд");
			
			var op = get_operand(cmd_shapes[1]);
			
			if (op.type == 'err')
				return make_ans(op.value);
			
			var native_codeB = (cmd_shapes[0] == 'push' ? '0' : '1');
			
			switch (op.type)
			{
				case 'reg':
					if (op.size == 8)
						return make_ans("Команда '" + cmd_shapes[0] + "' не взаимодействует с 8-битными регистрами");
					
					native_codeB = '0101' + native_codeB;
					
					return make_ans(codes_str_TO_codes(to_hex(native_codeB + op.r_m)));
				break;
				
				case 'mem':
					if (typeof op.size == 'string')
						return make_ans("У операнда неопределенный размер");
					
					native_codeB = (cmd_shapes[0] == 'push' ? '11111111' : '01111111');
					var reg_value = (cmd_shapes[0] == 'push' ? '110' : '000');
					
					switch (op.adrr) 
					{
						case 'reg':
							return make_ans(codes_str_TO_codes(to_hex(native_codeB + op.mod + reg_value + op.r_m)));
						break;
						
						case 'disponly':
							return make_ans(codes_str_TO_codes(to_hex(native_codeB + op.mod + reg_value + op.r_m) + ' ' + to_reverse_hex(int_to_sB(op.value, 32))));
						break;
						
						case 'reg+disp':
							return make_ans(codes_str_TO_codes(to_hex(native_codeB + op.mod + reg_value + op.r_m) + ' ' + to_reverse_hex(int_to_sB(op.dispval, op.disp_size))));
						break;
					}
				break;
				
				case 'imm':
					native_codeB = '011010' + native_codeB + '0';
					
					return make_ans(codes_str_TO_codes(to_hex(native_codeB) + ' ' + to_reverse_hex(int_to_sB(op.value, op.size))));
				break;
			}
		break;		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		case 'pusha':
		case 'popa':
			return make_ans(codes_str_TO_codes(to_hex('0110000' + (cmd_shapes[0] == 'pusha' ? '0' : '1'))));
		break;
		
		case 'mov':
		break;
		
		case 'call':
		break;
		
		case 'ret':
		break;
	}
	
	return {err: 'Неизвестная команда', codes: []};
}





// {address, cmd_text, codes_str, codes_len}
function disasm(address)
{
	var adr = address - address0
	if(adr >= PAGE) return {address: address, cmd_text: '', codes_str: '', codes_len: 0};

	var el = map_1;
	var a = adr;
	while(typeof el == 'object' && a < exe.length){
		el = el[exe[a]];
		a++;
	}
	if(typeof el == 'string'){
		if(a - adr != map[el].codes.length){
//!!!			console.log('')
			return {address: address, cmd_text: 'db ' + hex(exe[adr]), codes_str: hex(exe[adr]), codes_len: 1};
		}
		return {address: address, cmd_text: el, codes_str: map[el].codes_str, codes_len: map[el].codes.length};
	}else
		return {address: address, cmd_text: 'db ' + hex(exe[adr]) + 'h', codes_str: hex(exe[adr]), codes_len: 1};
}


// ТЕСТИРОВАНИЕ 
var tests = [
	{asm: 'inc al', codes_str: 'fe c0'},
	{asm: 'inc cl', codes_str: 'fe c1'},
	{asm: 'inc dl', codes_str: 'fe c2'},
	{asm: 'inc bl', codes_str: 'fe c3'},
	{asm: 'inc ah', codes_str: 'fe c4'},
	{asm: 'inc ch', codes_str: 'fe c5'},
	{asm: 'inc dh', codes_str: 'fe c6'},
	{asm: 'inc bh', codes_str: 'fe c7'},
	{asm: 'inc eax', codes_str: '40'},
	{asm: 'inc ecx', codes_str: '41'},
	{asm: 'inc edx', codes_str: '42'},
	{asm: 'inc ebx', codes_str: '43'},
	{asm: 'inc byte [eax]', codes_str: 'fe 00'},
	{asm: 'inc dword [ebp + 100]', codes_str: 'ff 45 64'},
	{asm: 'inc dword [ebp + 555h]', codes_str: 'ff 85 55 05 00 00'},
	{asm: 'inc ebp', codes_str: '45'},
	{asm: 'add al, [ebp-3]', codes_str: '02 45 fd'},
	{asm: 'add edi, [ebp-3]', codes_str: '03 7d fd'},
	{asm: 'add eax, [ebp+edx]', codes_str: '03 44 15 00'},
	{asm: 'add [ebp+edx], eax', codes_str: '01 44 15 00'},
	
	{asm: 'add al, [ebp-129]', codes_str: '02 85 7f ff ff ff'},
	{asm: 'add al, [ebp+128]', codes_str: '02 85 80 00 00 00'},
	{asm: 'add al, [ebp-1129]', codes_str: '02 85 97 fb ff ff'},
	{asm: 'add al, [ebp+1128]', codes_str: '02 85 68 04 00 00'},
	
	{asm: 'inc byte [ebp-129]', codes_str: 'fe 85 7f ff ff ff'},
	{asm: 'inc dword [ebp+128]', codes_str: 'ff 85 80 00 00 00'},
	{asm: 'inc byte [ebp-1129]', codes_str: 'fe 85 97 fb ff ff'},
	{asm: 'inc dword [ebp+1128]', codes_str: 'ff 85 68 04 00 00'},
	
	{asm: 'dec byte [edi-129]', codes_str: 'fe 8f 7f ff ff ff'},
	{asm: 'dec dword [esi+128]', codes_str: 'ff 8e 80 00 00 00'},
	{asm: 'dec byte [ecx-1129]', codes_str: 'fe 89 97 fb ff ff'},
	{asm: 'dec dword [edx+1128]', codes_str: 'ff 8a 68 04 00 00'},
	
	{asm: 'neg ah', codes_str: 'f6 dc'},
	{asm: 'neg cl', codes_str: 'f6 d9'},
	{asm: 'neg ebx', codes_str: 'f7 db'},
	{asm: 'neg esi', codes_str: 'f7 de'},
	{asm: 'neg 7;', codes_str: 'Не должно компилироваться'},
	{asm: 'neg byte [7]', codes_str: 'f6 1d 07 00 00 00'},
	{asm: 'neg dword [7]', codes_str: 'f7 1d 07 00 00 00'},
	{asm: 'neg byte [-3]', codes_str: 'f6 1d fd ff ff ff'},
	{asm: 'neg dword [-3]', codes_str: 'f7 1d fd ff ff ff'},
	{asm: 'nop', codes_str: '90'},
	{asm: 'neg byte [eax]', codes_str: 'f6 18'},
	{asm: 'neg byte[esi]', codes_str: 'f6 1e'},
	{asm: 'neg byte[eax+2]', codes_str: 'f6 58 02'},
	{asm: 'neg byte[esi+2]', codes_str: 'f6 5e 02'},
	{asm: 'neg byte[eax-3]', codes_str: 'f6 58 fd'},
	{asm: 'neg byte[esi-3]', codes_str: 'f6 5e fd'},
	{asm: 'neg byte[ebx+255]', codes_str: 'f6 9b ff 00 00 00'},
	{asm: 'neg byte[edi+255]', codes_str: 'f6 9f ff 00 00 00'},
	{asm: 'neg byte[ecx-254]', codes_str: 'f6 99 02 ff ff ff'},
	{asm: 'neg byte[edi-254]', codes_str: 'f6 9f 02 ff ff ff'},
	{asm: 'neg byte[edx+1255]', codes_str: 'f6 9a e7 04 00 00'},
	{asm: 'neg byte[edi+1255]', codes_str: 'f6 9f e7 04 00 00'},
	{asm: 'neg byte[ebp-1254]', codes_str: 'f6 9d 1a fb ff ff'},
	{asm: 'neg byte[esi-1254]', codes_str: 'f6 9e 1a fb ff ff'},
	{asm: 'neg byte[eax+ebp]', codes_str: 'f6 1c 28'},
	{asm: 'neg byte[esi+edx]', codes_str: 'f6 1c 16'},
	{asm: 'neg [esi-edx];', codes_str: 'Не должно компилироваться'},
	{asm: 'neg byte[esi+ecx]', codes_str: 'f6 1c 0e'},
	{asm: 'nop', codes_str: '90'},
	{asm: 'neg dword [eax]', codes_str: 'f7 18'},
	{asm: 'neg dword [esi]', codes_str: 'f7 1e'},
	{asm: 'neg dword [eax+2]', codes_str: 'f7 58 02'},
	{asm: 'neg dword [esi+2]', codes_str: 'f7 5e 02'},
	{asm: 'neg dword [eax-3]', codes_str: 'f7 58 fd'},
	{asm: 'neg dword [esi-3]', codes_str: 'f7 5e fd'},
	{asm: 'neg dword [ebx+255]', codes_str: 'f7 9b ff 00 00 00'},
	{asm: 'neg dword [edi+255]', codes_str: 'f7 9f ff 00 00 00'},
	{asm: 'neg dword [ecx-254]', codes_str: 'f7 99 02 ff ff ff'},
	{asm: 'neg dword [edi-254]', codes_str: 'f7 9f 02 ff ff ff'},
	{asm: 'neg dword [edx+1255]', codes_str: 'f7 9a e7 04 00 00'},
	{asm: 'neg dword [edi+1255]', codes_str: 'f7 9f e7 04 00 00'},
	{asm: 'neg dword [ebp-1254]', codes_str: 'f7 9d 1a fb ff ff'},
	{asm: 'neg dword [esi-1254]', codes_str: 'f7 9e 1a fb ff ff'},
	{asm: 'neg dword [eax+ebp]', codes_str: 'f7 1c 28'},
	{asm: 'neg dword [esi+edx]', codes_str: 'f7 1c 16'},
	{asm: 'neg dword [esi-edx];', codes_str: 'Не должно компилироваться'},
	{asm: 'neg dword [esi+ecx]', codes_str: 'f7 1c 0e'},
];
/*	
for (var i in tests){
	var a = asm(0, tests[i].asm);
	console.log(tests[i].asm, 'expected:', tests[i].codes_str, 'got:', codes_TO_codes_str(a.codes), 'result:', tests[i].codes_str == codes_TO_codes_str(a.codes));
}
*/