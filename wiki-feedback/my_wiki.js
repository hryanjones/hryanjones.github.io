/**
 * Stolen and largely rewritten from 
 * Wiky.js - Javascript library to converts Wiki MarkUp language to HTML.
 * You can do whatever with it. Please give me some credits (Apache License)
 * - Tanin Na Nakorn 
 * This file created by H. Ryan Jones
 * 2nd Feb 2013
 */

var wiki = {
    options: {
        'link-image': true //Preserve backward compat
    },
}

//GLOBAL VARIABLES
wiki.regexes = {
	'list': new RegExp('^[\*\#]+'),
	'indent': new RegExp('^:+'),
	'line': new RegExp('^----+(\s*)$'),
	'empty-line': new RegExp('^\s*$'),
	'header': new RegExp('^='),
	'unformatted-block': new RegExp('^\ +'),
	'table': new RegExp('^{{0,1}\\|'),
	'start-table': new RegExp('^{\\|'),
	'end-table': new RegExp('^\\|}'),
};

wiki.process = function(wikitext, options) {

  wiki.options = options || wiki.options;

	var lines = wikitext.split(/\r?\n/);
	
	var html = "";
	i = 0; // index over which we'll loop over lines

	for (i=0;i<lines.length;i++) {
	
		line = lines[i];
		unformatted_line = lines[i]; //used in the titles of the wiki markup

		//-------SECTION 1-------
		//Single line operations (added to html directly)

		//INDENTATION -- this section needs to be rewritten like lists
		//and then could be moved to Section 2
		if ( line.match(wiki.regexes['indent']) ) {
			// find start line and ending line
			start = i;
			while (i < lines.length && lines[i].match(/^\:+/)) i++;
			i--;
			
			html += wiki.addLine( wiki.process_indent(lines,start,i) , unformatted_line);
			continue;
		}
		//HORIZONTAL LINE
		else if (line.match(wiki.regexes['line'])) {
			html += wiki.addLine( "<hr/>" , unformatted_line);
			continue;
		}
		//UNFORMATTED BLOCK
		else if (line.match(wiki.regexes['unformatted-block'])) {
			//echoDebug('unformatted block = ' + line);
			open_block = '<xmp>';
			close_block = '</xmp>';
			if ( wiki.getRelativeLine(lines,i,-1).match(wiki.regexes['unformatted-block']) ) {
				open_block = '\n';
			}
			if ( wiki.getRelativeLine(lines,i,+1).match(wiki.regexes['unformatted-block']) ) {
				close_block = '';
			}
			html += open_block + line.replace(/^\s/,'') + close_block;
			continue;
		}
		//TABLES (start and end)
		else if ( line.match(wiki.regexes['start-table']) ) {
			var error = '';
			var extra_stuff = line.replace(wiki.regexes['start-table'],'').match(/\S+/); 
			if (extra_stuff) { // if anything extra on the line
				error = wiki.returnErrorHTML(
					extra_stuff[0],
					'No extra characters allowed on start or end table line.'
				);
			}
			html += '<table>\n<tbody>\n' + error;
			continue;
		}
		else if ( line.match(wiki.regexes['end-table']) ) {
			var error = '';
			var extra_stuff = line.replace(wiki.regexes['end-table'],'').match(/\S+/); 
			if (extra_stuff) { // if anything extra on the line
				error = wiki.returnErrorHTML(
					extra_stuff[0],
					'No extra characters allowed on start or end table line.'
				);
			}
			html += '</tbody>\n</table>\n' + error;
			continue;
		}

		//-------SECTION 2-------
		//Line preprocessing which can be mixed with other markup
		
		//LIST
		if ( line.match(wiki.regexes['list']) ) {
			// in order to process the current line you only need the previous and next line

			prev_line = wiki.getRelativeLine(lines,i,-1);
			next_line = wiki.getRelativeLine(lines,i,+1);

			line = wiki.addLine( wiki.process_bullet_point(prev_line, line, next_line) , unformatted_line);
		}

		//LINE BREAK
		else if (line.match(wiki.regexes['empty-line'])) { // if empty line this means explicit line break
			line = wiki.addLine( "<p></p>\n" ); //not very good HTML, but it'll be okay ;)
		}

		//HEADERS, this needs to be able to handle bold & links and such
		else if ( line.match(wiki.regexes['header']) ) {
			// =title= -> means it'll be 1, or <h1>, ==subtitle== -> 2
			var header_number = line.match(/^=+/)[0].length;
			//echoDebug(line + ' has a header number of ' + header_number);
			line = line.replace(/^=+/, '<h' + header_number + '>').replace(/=*$/, '</h' + header_number + '>');
		}

		//TABLES
		else if ( line.match(wiki.regexes['table']) ) {

			line = line.replace(wiki.regexes['table'],'<tr><td>').replace(/\|\|/g,'</td><td>').replace(/$/,'</td></tr>');
		}

		html += wiki.addLine( wiki.process_normal(line), unformatted_line);
		
		//html += "<br/>\n"; // breaks should only be put in for explicit line breaks, but this is debatable
	}
	
	return html;
}

wiki.returnErrorHTML = function(error_text, mouseover_text) {
	return '<font color="red" title="' + mouseover_text + '">' + error_text + '</font>';
}

wiki.getRelativeLine = function(lines,i,offset) {
	new_line_index = i+offset;
	if ( new_line_index > 0 && new_line_index < lines.length-1 ) {
		return lines[new_line_index];
	}
	else {
		return '';
	}
}

wiki.addLine = function( html, title ) {
	//return '<span class="wikiline" title="' + title + '">' + html + '</span>';
	return '<span class="wikiline">' + html + '</span>';
}

wiki.process_indent = function(lines,start,end) {
	var i = start;
	
	var html = "<dl>";
	
	for(var i=start;i<=end;i++) {
		
		html += "<dd>";
		
		var this_count = lines[i].match(/^(\:+)/)[1].length;
		
		html += wiki.process_normal(lines[i].substring(this_count));
		
		var nested_end = i;
		for (var j=i+1;j<=end;j++) {
			var nested_count = lines[j].match(/^(\:+)/)[1].length;
			if (nested_count <= this_count) break;
			else nested_end = j;
		}
		
		if (nested_end > i) {
			html += wiki.process_indent(lines,i+1,nested_end);
			i = nested_end;
		}
		
		html += "</dd>";
	}
	
	html += "</dl>";
	return html;
}

wiki.process_bullet_point = function(prev_line, this_line, next_line) {
	//echoDebug( [prev_line,this_line,next_line].join(', ') );
	html = '';
	var prev_match = prev_line.match(wiki.regexes['list']);
	if ( prev_match ) { prev_match = prev_match [0] }
	else { prev_match = ''; }
	var this_match = this_line.match(wiki.regexes['list'])[0];
	var next_match = next_line.match(wiki.regexes['list']);
	if ( next_match ) { next_match = next_match [0] }
	else { next_match = ''; }

	if ( this_match.length > prev_match.length ) { // starting a (possibly nested) list
		html += wiki.start_nested_list(prev_match, this_match, html);
	}

	html += this_line.replace(/^[\*\#]+ /,'<li>').replace(/$/,'</li>\n');
	//html += wiki.addLine( this_line.replace(/^[\*\#]+ /,'<li>').replace(/$/,'</li>\n') , unformatted_line);

	if ( this_match.length > next_match.length ) { // ending (possibly nested) list(s)
		var these_types = this_match.replace(next_match,''); // all the list types to end
		html += wiki.end_nested_lists(these_types);
	}

	return html;
}

wiki.start_nested_list = function(prev_match, this_match) {
	var this_type = this_match.replace(prev_match,'');
	//echoDebug([this_type,this_match,prev_match].join(', '));
	if (this_type.length == 1) {
		return this_type.replace(/\*/,'<ul>\n').replace(/\#/,'<ol>\n');
	}
	else {
		var error_text = '(mouseover for info)';	
		var explanation = 'It appears that you started using a different list type ' +
			'partway through a given list, e.g. ** and next line *#, or you need a space.';
		return wiki.returnErrorHTML(error_text, explanation);
	}
}

wiki.end_nested_lists = function(these_types) {
	these_types = these_types.split('').reverse().join('');
	return these_types.replace(/\*/g,'</ul>\n').replace(/\#/g,'</ol>\n');
}

wiki.process_url = function(txt) {
	
	var index = txt.indexOf(" "),
        url = txt,
        label = txt,
        css = '';

	if (index !== -1) {
		url = txt.substring(0, index);
		label = txt.substring(index + 1);
	}

  if ( url.match(/^mailto/) ) {
    // quick fix for mailto links to be properly formatted see http://goo.gl/OhIG2
    url = url.replace(/^mailto:\/\//,'mailto:');
    label = url.replace(/^mailto:/,'');
  }
	
	return '<a href="' + url + '"' + (wiki.options['link-image'] ? css : '') + '>' + label + '</a>';
};

wiki.process_image = function(txt) {
	var index = txt.indexOf(" ");
	url = txt;
	label = "";
	
	if (index > -1) 
	{
		url = txt.substring(0,index);
		label = txt.substring(index+1);
	}
	
	
	return "<img src='"+url+"' alt=\""+label+"\" />";
}

wiki.process_video = function(url) {

	if (url.match(/^(https?:\/\/)?(www.)?youtube.com\//) == null)
	{
		return "<b>"+url+" is an invalid YouTube URL</b>";
	}
	
	if ((result = url.match(/^(https?:\/\/)?(www.)?youtube.com\/watch\?(.*)v=([^&]+)/)) != null)
	{
		url = "http://www.youtube.com/embed/"+result[4];
	}
	
	
	return '<iframe width="480" height="390" src="'+url+'" frameborder="0" allowfullscreen></iframe>';
}

wiki.process_normal = function(wikitext) {
	
	if ( wikitext.match(/\[\[/) ) {
	// Image
		var index = wikitext.indexOf("[[File:");
		var end_index = wikitext.indexOf("]]", index + 7);
		while (index > -1 && end_index > -1) {
			
			wikitext = wikitext.substring(0,index) 
						+ wiki.process_image(wikitext.substring(index+7,end_index)) 
						+ wikitext.substring(end_index+2);
		
			index = wikitext.indexOf("[[File:");
			end_index = wikitext.indexOf("]]", index + 7);
		}
	
	// Video
		var index = wikitext.indexOf("[[Video:");
		var end_index = wikitext.indexOf("]]", index + 8);
		while (index > -1 && end_index > -1) {
			
			wikitext = wikitext.substring(0,index) 
						+ wiki.process_video(wikitext.substring(index+8,end_index)) 
						+ wikitext.substring(end_index+2);
		
			index = wikitext.indexOf("[[Video:");
			end_index = wikitext.indexOf("]]", index + 8);
		}
	}
	
	
	// URL
	var protocols = ["http","https","ftp","news",];//,"mailto"];
	
	for (var i=0;i<protocols.length;i++)
	{
		var index = wikitext.indexOf("["+protocols[i]+"://");
		var end_index = wikitext.indexOf("]", index + 1);
		while (index > -1 && end_index > -1) {
		
			wikitext = wikitext.substring(0,index) 
						+ wiki.process_url(wikitext.substring(index+1,end_index)) 
						+ wikitext.substring(end_index+1);
		
			index = wikitext.indexOf("["+protocols[i]+"://", end_index+1);
			end_index = wikitext.indexOf("]", index + 1);
			
		}
	}

	// also process relative links
	var relativeLinkPrefixes = ['/', './', '../', 'mailto:'];
	for (var i = 0; i < relativeLinkPrefixes.length; i++) {
		var index = wikitext.indexOf("[" + relativeLinkPrefixes[i]);
		var end_index = wikitext.indexOf("]", index + 1);
		while (index > -1 && end_index > -1) {

			wikitext = wikitext.substring(0, index)
				+ wiki.process_url(wikitext.substring(index + 1, end_index))
				+ wikitext.substring(end_index + 1);

			index = wikitext.indexOf("[" + relativeLinkPrefixes[i], end_index + 1);
			end_index = wikitext.indexOf("]", index + 1);

		}
	}
	
	var toggle_close = {
		"":"/",
		"/":"",
	};
	var close_string = "";
	while ( wikitext.match(/'''/) ) {
		wikitext = wikitext.replace(/'''/,"<" + close_string + "b>");
		close_string = toggle_close[close_string];
	}
	
	close_string = "";
	while( wikitext.match(/''/) ) {
		wikitext = wikitext.replace(/''/,"<" + close_string + "i>");
		close_string = toggle_close[close_string];
	}
	
	wikitext = wikitext.replace(/<\/b><\/i>/g,"</i></b>");
	
	return wikitext;
}

if (typeof exports === 'object') {
    for (var i in wiki) {
        exports[i] = wiki[i];
    }
}
