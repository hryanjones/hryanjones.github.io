%  Matlab script to: help the user make some nice plots of storm tracks and AMSR data
%      NOTE:  tracks come from ASCII files from Jerome (created by way of Simmonds)
%             which have been run through sep_tracks.sh and reform_tracks.m
%  Author:  H. Ryan Jones
%  Created:  June 28, 2006
%  Last Modified: June 29,2006

ld=0;        % set this to 1 to load everything the first time
range=[278.1250 330  20 55];  % specify a range ([lonmin lonmax latmin latmax])
	     % for the total track plot - empty=use AMSR range (please don't
             % go outside amsr range [278.1250  359.8750   10.1250   62.8750])

pathdat='/export/circ/hrj/storm_tracking/tracks/2002'  %%%%%DATDIR
pathpic='/export/circ/hrj/storm_tracking/pictures/2002'
eval(['cd ' pathdat])


%%%%%%%%%%%%%%%    LOAD STUFF    %%%%%%%%%%%%%%%

%LOAD IN TRACKS AND MAKE LIST OF TRACK NAMES (TRKS)

if ld
  disp('Loading Tracks')
  d=dir('trk*mat');
  trks=[];

  for x=1:length(d)
    trk=d(x).name;
    eval(['load ' trk])
    trks=strvcat(trks,trk(1:end-4));
%    disp(trk)
  end; clear x trk
end

%FIND THE MIN/MAX date of Track data

if ~exist('trks')
  error('Need to make initial load - change ld=1')
end

date=[];
for x=1:length(trks)
  eval(['date=[date;' deblank(trks(x,:)) '(:,1)];'])
end

mndate=min(date)
mxdate=max(date)
disp(['Tracks run from ' datestr(mndate,0) ' to ' datestr(mxdate,0)])


%LOAD AMSR DATA AND CUT IT TO RELEVENT DATES AND/OR RANGE

if ld
  disp('Loading AMSR data - this may take a sec')
  load /export/alt2/archive/sst/amsr_tmi_fused/fused_gulfstream.mat
end

%reset names to prevent carple tunnel :)
if exist('sst_fused')
  sst=sst_fused; lon=lon_fused; lat=lat_fused; time=time_fused;
  clear *_fused
end

%see if the tracks and the AMSR data overlap (very simple right now 
%might need to be made more robust - e.g. for end of tracks too)
matchtime=eval([ deblank(trks(1,:)) '(1,1)>min(time)']);
if ~matchtime
  disp('Dates of Track Data don''t match AMSR')
end

if matchtime  
  i=find(time>=mndate & time<=mxdate);
  sst=sst(:,:,i);
  time=time(i);
end

if ~isempty(range)
  j=find(lon>=range(1) & lon<=range(2));
  i=find(lat>=range(3) & lat<=range(4));
  lon=lon(j);
  lat=lat(i);
  sst=sst(i,j,:);
end

%check that everything still matches and is non-zero
if (isempty(lat) | isempty (lon) | isempty(time))
  whos lat lon time
  error('lat, lon, or time got lost')
end
[x y t]=size(sst);
if (length(lat)~=x | length(lon)~=y | length(time)~=t)
  whos lat lon timea
  error('AMSR sst array no longer matches lon &/| lat &/ time')
end; clear x y t


%%%%%%%%%%%%    MAKE SOME "LOVELY" PLOTS    %%%%%%%%%%%%%

%FIRST PLOT ALL THE TRACKS ON TOP OF AVERAGED AMSR

clf
if isempty(range)
  range=[min(lon) max(lon) min(lat) max(lat)]; % range of mapping
end

if matchtime
  t=find(time>=mndate & time<=mxdate);
else
  t=round(yrday(mndate));
  i=find(yrday(time)==t);
  t=time(i);t=t(1);
  t=find(time>=t & time<=(t+floor(mxdate-mndate)));
end
tmp=squeeze(mean(sst(:,:,t),3));
figure(1)
imagesc(lon,lat,tmp);colorbar;axis xy
colorbar;axis xy;hold on;
title(['Storm Tracks: ' datestr(mndate,28) '-' datestr(mxdate,28) ' (Averaged AMSR SST)'])

worldmap(range);

for x=1:size(trks,1) %[1 45 55 9 15 3 4 58 73] 
  var=deblank(trks(x,:));
  eval(['lngth=size(' var ',1);'])
  eval(['plot(' var '(:,2),' var '(:,3),''k.-'')'])
%  eval(['plot(' var '(:,2),' var '(:,3),''m.-'')'])
end

disp(['saving to ' pathpic '/all_tracks (careful of overwrite)'])
pause
eval(['print -djpeg ' pathpic '/all_tracks']);


%HELP PICKOUT INTERESTING TRACKS

[gx gy]=gradient(tmp);
g=gx.^2+gy.^2;
figure(2)
imagesc(lon,lat,g,[0 .5]);colorbar;axis xy; hold on
worldmap(range);


%LOOK FOR GOOD TRACKS

look=[];
for x=1:size(trks,1)
  var=deblank(trks(x,:));
  eval(['lngth=size(' var ',1);'])
  gsrange=[285 320 35 50];
  if eval(['and(find(sum(' var '(:,2)>=gsrange(1) & ' var '(:,2)<=gsrange(2))),sum(find(' var '(:,3)>=gsrange(3) & ' var '(:,3)<=gsrange(4))))']);
    look=[look x];
  end
end
disp(['There are ' num2str(length(look)) ' tracks to look through'])

Q=[];

if exist('lookcloser')
  Q=input('Do you want to look at tracks again? (1/0)');
end

if (~exist('lookcloser') | Q)
  lookcloser=[];
  for x=1:length(look)
    var=deblank(trks(look(x),:));
    disp(var)
    hold off
    clf
    imagesc(lon,lat,g,[0 .5]);colorbar;axis xy
    hold on
    eval(['plot(' var '(:,2),' var '(:,3),''m.-'')'])
    Q=input('Enter 1 to look at more detailed plots related to this track (0 not)');
    if Q
      lookcloser=[lookcloser look(x)]
    end
  end
end

%MAKE 4-PANE PLOTS OF PICKED OUT TRACKS

figure(3)
for x=1:length(lookcloser)
  var=deblank(trks(lookcloser(x),:));
  disp(var)
  eval(['mint=round(min(' var '(:,1)));maxt=round(max(' var '(:,1)));'])
  if matchtime
    t=find(time>=mint & time<=maxt);
  else
    t=yrday(mint);
    i=find(yrday(time)==t);
    t=time(i);t=t(1);
    t=find(time>=t & time<=(t+floor(maxt-mint)));
  end
  tmp=squeeze(mean(sst(:,:,t),3));
  [gx gy]=gradient(tmp);
  g=gx.^2+gy.^2;
  subplot(2,2,1);
    imagesc(lon,lat,g,[0 5]);axis xy
    hold on
    eval(['plot(' var '(:,2),' var '(:,3),''m.-'')'])
    eval(['plot(' var '(1,2),' var '(1,3),''mo'')'])
    eval(['plot(' var '(end,2),' var '(end,3),''mx'')'])
    worldmap(range);
    title(['' datestr(mint,10) ' Storm Track: ' datestr(mint,6) '-' datestr(maxt,6) ' (del^2 of AMSR)'])
  subplot(2,2,2);
    eval(['plot(' var '(:,4),''g.-'')'])
    title('Intensity (Central Pressure) vs Time')
    xlabel('Time (6 hour increments)')
    ylabel('Intensity (Central Pressure - mbar)')
  subplot(2,2,3);
%    eval(['plot(' var '(:,7),' var '(:,4),''bo'')'])
%    title('Intensity (Central Pressure) vs. Sensible Heat Flux')
%    xlabel('Sensible Heat Flux') %%%%%%%%%%%%%%% UNITS!?
%    ylabel('Intensity (Central Pressure - mbar)')
    eval(['plot(' var '(:,7),''bo--'')'])
    title('Sensible Heat Flux vs. Time')
  subplot(2,2,4);
%    eval(['plot(' var '(:,8),' var '(:,4),''bo'')'])
%    title('Intensity (Central Pressure) vs. Latent Heat Flux')
%    xlabel('Latent Heat Flux') %%%%%%%%%%%%%%% UNITS?!
%    ylabel('Intensity (Central Pressure - mbar)')
    eval(['plot(' var '(:,8),''bo--'')'])
    title('Latent Heat Flux vs. Time')
  Q=input('Would you like to save the displayed plots? (1/0)');
  if Q
    eval(['print -dpsc ' pathpic '/' var '_plot']);
    disp(['saving to path ' pathpic '/' var '_plot'])
  end
end














%Bad extra Code
if 0
if (~exist('gooduns') | isempty(gooduns))

%pause

[i j]=find(g(:,:)>.3);
lati=round(2*(lat(i)'))/2;
lonj=round(2*(lon(j)'))/2;
gooduns=[]; incr=1; q=[];
for x=1:size(trks,1)
  var=deblank(trks(x,:));
  eval(['lngth=size(' var ',1);'])
  for y=1:lngth
    r=[];
    eval(['q=find(' var '(y,3)==lati);'])
    for z=1:length(q)
      if eval([ var '(:,2)==lonj(q(z))'])
        r=[r y];
      end
    end
    if ~isempty(r)
      disp(var)
      eval(['plot(' var '(:,3),' var '(:,2),''k.-'')'])
      eval(['plot(' var '(r,3),' var '(r,2),''m.'')'])
      pause
      gooduns(incr).name=var;
      gooduns(incr).vals=r;
      incr=incr+1;
      clf
      imagesc(lon,lat,g,[0 .5]);colorbar;axis xy; hold on
      worldmap(range);
    end
  end
end

end % if~exist(gooduns)
end % if 0
