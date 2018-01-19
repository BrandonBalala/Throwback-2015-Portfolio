<?php
	// Declare necessary variables
	$host = 'localhost/mburgess/Dawsonchat';
	$user = 'chatpgm';
	$passwd='V9p5r';
	$database = 'ia2chat';
	$table = 'messages';

	//Get variables sent from client
	
	$msgNo = $_POST['msgNo'];
	$username = $_POST['username'];
	$msg = $_POST['msg'];

	//Connect to the database 
	$connection = mysql_connect("localhost", "chatpgm", "V9p5r");
	if (mysql_select_db($database, $connection) === FALSE){
		echo "unable to select database <br/>";
	}

	
	//Test for type of data received
	if ($msgNo == 0){				//Chatbox is being activated
		getWelcome($connection);
	}
	elseif ($msg == "none"){		//Periodic retrieval with no send
		getNewMessages($connection, $msgNo);
	}
	else {							//Message received
		storeMessage($connection, $username, $msg);
		getNewMessages($connection, $msgNo);
	}

	mysql_close($connection);

	function getLast($connection){
		$SQLcmd = "SELECT msgNO FROM messages ORDER BY msgNO DESC LIMIT 1";
		$results = mysql_query($SQLcmd, $connection);

		
		while ($row = mysql_fetch_assoc($results)){
			$last = $row['msgNO'];
		}
	
		return $last;	
	}
	
	function getWelcome($connection){
		$last = getLast($connection);
		$SQLcmd = "SELECT * FROM messages WHERE (msgNO<3)";
		getData($SQLcmd, $connection, $last);
		
	}


	function getNewMessages($connection, $msgNo){
		$last = getLast($connection);
		$SQLcmd = "SELECT * FROM messages WHERE (msgNO>".$msgNo.")";
		
		getData($SQLcmd, $connection, $last);

	}

	
	function getData($SQLcmd, $connection, $last){
		$results = mysql_query($SQLcmd, $connection);
		if ($results === FALSE){
			echo "unable to execute the query - error code ";//.mysql_errno($connection).": ".mysql_error($connection);
		}
		elseif ($results){

			echo "<chat id = '$last'>";
			//while ($row = mysql_fetch_array($results,))
			while ($row = mysql_fetch_assoc($results))
			{
				echo "<message>";
				echo "<msgNo>".$row['msgNO']."</msgNo>";
				echo "<username>".$row['username']."</username>";
				echo "<msg>".$row['msg']."</msg>";
				echo "</message>";
			}
			echo "</chat>";
		}
		

	}


	function storeMessage($connection, $username, $msg){
		//echo "storeMsg" . $username. $msg;
		$SQLcmd = "INSERT INTO messages (username,msg) VALUES ('".$username."','".$msg."')";
		$results = mysql_query($SQLcmd, $connection);
		if ($results === FALSE){
			echo "unable to execute the query - error code ".mysql_errno($connection).": ".mysql_error($connection);
		}

	}
	
?>

