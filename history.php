<?php include('head.php'); ?>
<?php include('header.php'); ?>
<div class="content">
<!-- <middle> -->
<?php include('left.php'); ?>
<div class="rightbar">

		<div class="game-number"><?=$msg['history']?></div>

		<div class="settings-info">
			<div><?=$msg['history_igrok']?></div>
			<div><?=$msg['history_igrok_vesh']?></div>
		</div>

		<div id="history-page">
	<div class="loading"><?=$msg['load']?>...</div>
		</div>
	
		
		
		<div class="copyright">Powered by Steam, a registered trademark of Valve Corporation</div>

	</div>

<!-- </middle> -->
	<div class="clear"></div>
</div>

</body>
</html>