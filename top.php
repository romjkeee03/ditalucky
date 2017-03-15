<?php include('head.php'); ?>
<?php include('header.php'); ?>
<div class="content">
<!-- <middle> -->
<?php include('left.php'); ?>

	<div class="rightbar">

		<div class="game-number"><?=$msg['top']?></div>

		<div class="top-statistics hidden">
			<div class="block"><div id="count-top">0</div><?=$msg['igrok_vr']?></div>
			<div class="block"><div id="inf10">0</div><?=$msg['max_win']?></div>
			<div class="block"><div id="inf3">0</div><?=$msg['seg_igrokov']?></div>
			<div class="block"><div id="inf14">0</div><?=$msg['seg_igr']?></div>
		</div>

		<div class="table">

		
			
				<div class="topss">
			<div class="loading"><?=$msg['load']?>...</div>
</div>


			

		

		</div>

		<div class="copyright">Powered by Steam, a registered trademark of Valve Corporation</div>

	</div>

<!-- </middle> -->
	<div class="clear"></div>
</div>

</body>
</html>