			test("start nested list", function() {
				var outs_ins = [ //ouputs mapping to array of inputs
					['\n<ul>\n', '#', '#*', ''],
					['\n<ul>\n', '#**', '#***', ''],
					['\n<ol>\n', '*', '*#', ''],
					['\n<ol>\n', '***', '***#', ''],
				]
				//echoDebug( JSON.stringify(outs_ins), false );
				for (i in outs_ins) {
					//echoDebug(out);
					equal(
						wiki.process_bullet_point.start_nested_list(
							outs_ins[i][1], 
							outs_ins[i][2], 
							outs_ins[i][3]
						), outs_ins[i][0] );
				}
			});
			test("end nested lists", function() {
				var outs_ins = [ //ouputs mapping to array of inputs
					['</li>\n</ul>\n</li>\n</ol>\n', '#*', ''],
					['</li>\n</ul>\n</li>\n</ul>\n</li>\n</ul>\n</li>\n</ol>\n', '#***', ''],
					['</li>\n</ol>\n</li>\n</ul>\n', '*#', ''],
					['</li>\n</ol>\n</li>\n</ul>\n</li>\n</ul>\n</li>\n</ul>\n', '***#', ''],
					['<ul>\n<li>item</li>\n</ul>\n', '*', '<ul>\n<li>item'],
				]
				//echoDebug( JSON.stringify(outs_ins), false );
				for (i in outs_ins) {
					//echoDebug(out);
					equal(
						wiki.process_bullet_point.end_nested_lists(
							outs_ins[i][1], 
							outs_ins[i][2], 
							outs_ins[i][3]
						), outs_ins[i][0] );
				}
			});
