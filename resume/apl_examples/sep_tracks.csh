#!/bin/csh
#  Name: sep_tracks.csh
#  Purpose:  To take outputs from Jerome Patoux's modified version of Simmond's
#     cyclone tracking program and write the tracks to ASCII data (for input
#     into Matlab)
#  Author:  H. Ryan Jones
#  Creation Date:  June 27, 2006
#  Last Modified:  June 29, 2006

echo "process ID: $$"
set dir='/export/circ/hrj/storm_tracking'
cd $dir
echo $dir
set tracknum=1233         #####SET the (# OF TRACKS +1) HERE

foreach file (tracks2002.dat)  #####SET the INPUT FILES THAT JEROME SENDS HERE
  echo $file
  set dirout=$dir/tracks/2002  ####CHANGE THIS FOR DIFFERENT SETS
  echo $dirout
  mkdir $dirout


# first remove blanks
  sed -e '/^$/d' $file > dum1
# next remove column headers
  sed -e '/^.........t/d' dum1 > dum2
#next loop data into separate track files so Matlab can read it in more easily  
  set num=1
  while ($num < $tracknum) 
    echo $num
    set fileout=$dirout/trk$num.dat
    sed -e '1d' dum2 > dum3
    sed -ne '1,/.Track/p' dum3 | sed -e '/Track/d' > $fileout
    sed -e '1,/.Track/d' dum3 > dum2
    @ num++
  end
rm dum?  # cleanup

#some of the fluxes get large enough to connect columns = bad, add a space
cd $dirout
foreach file (trk*dat)
  sed -e 's/-/ -/g' $file > dum4
  cat dum4 > $file
end
echo "done fixing overly large columns"
echo "Now run matlab reform_tracks.m to get useful data and reformat to Matlab"
