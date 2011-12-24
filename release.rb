first = false
last = false
File.open("index.html", "w") do |out|
	File.readlines("jjtimer.html").each do |l| 
		if l =~ /<script type="text\/javascript" src="([^"]+)"><\/script>/
			if !first
				first = true
				out.print "<script type=\"text/javascript\">\n"
			end
			last = true
			out.print File.read $1
		else
			if last
				out.print "\n</script>"
			end
			last = false
			out.print l
		end
	end
end
