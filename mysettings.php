<?php include('head.php'); ?>
<?php include('header.php'); ?>
<div class="content">
<!-- <middle> -->

	
<?php include('left.php'); ?>
<div class="rightbar">

		<div class="game-number"><?=$msg['settings']?></div>

		<div class="settings-info">
			<div><?=$msg['My_settings']?></div>
			<div><?=$msg['After_setting_the_parameters_save_your_changes']?></div>
		</div>

		<div class="settings-url hidden">
			<div class="left"><?=$msg['Enter_link_exchange']?></div>
			<div class="right">
				<input type="text" rel="get-trade-link" placeholder="Вставьте ссылку...">
				<input type="submit" id="save-link" value="">
				</div>
		</div>

		<div class="settings-text"><?=$msg['Attention!_make_your_inventory_visible_and_open to_all_as_well_as_being_enter_your_link_exchange.']?></div>

		<div class="copyright">Powered by Steam, a registered trademark of Valve Corporation</div>

	</div>

<!-- </middle> -->
	<div class="clear"></div>
</div>

</body>
</html>