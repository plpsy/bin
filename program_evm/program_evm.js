// factory_defaults dss script
// Import the DSS packages into our namespace to save on typing
importPackage(Packages.com.ti.debug.engine.scripting);
importPackage(Packages.com.ti.ccstudio.scripting.environment);
importPackage(Packages.java.lang);
importPackage(Packages.java.io);
importPackage(Packages.java.util);

// Create our scripting environment object - which is the main entry point into
// any script and the factory for creating other Scriptable ervers and Sessions
var script = ScriptingEnvironment.instance()

var debugScriptEnv = ScriptingEnvironment.instance();
// program_evm environment.
testEnv = {};

// Get the Debug Server and start a Debug Session
var debugServer = script.getServer("DebugServer.1");

//***************Functions define***************************


function isFile(path)
{
	try
	{   
		file = new java.io.FileReader(path);
	}
	catch (ex)
	{
		return false;
	}

	return true;

}


//****************Get New Time Stamp***********************
function localTime()
{
	// get time stamp
	var currentTime = new Date();
	var year = currentTime.getFullYear();
	var month = currentTime.getMonth() + 1;
	month = month + "";
	if (month.length == 1)
	{
		month = "0" + month;
	}
	var day = currentTime.getDate();
	var hour = currentTime.getHours();
	var minute = currentTime.getMinutes();
	minute = minute + "";
	if (minute.length == 1)
	{
		minute = "0" + minute;
	}
	var second = currentTime.getSeconds();
	second = second + "";
	if (second.length == 1)
	{
		second = "0" + second;
	}
    
	return (year+"_"+month+"_"+day+"_"+hour+minute+second);
}

/**
 * Get error code from the given exception.
 * @param {exception} The exception from which to get the error code.
 */
function getErrorCode(exception)
{
	var ex2 = exception.javaException;
	if (ex2 instanceof Packages.com.ti.ccstudio.scripting.environment.ScriptingException) {
		return ex2.getErrorID();
	}
	return 0;
}
function fileCopy(source,destination)
{
	inputFile = new File(source);
    outputFile = new File(destination);
    infile = new  java.io.FileReader(inputFile);
    out = new java.io.FileWriter(outputFile);
    var c;

    while ((c = infile.read()) != -1)
      out.write(c);

    infile.close();
    out.close();
}

function pausecomp(millis)
 {
  var date = new Date();
  var curDate = null;
  do { curDate = new Date(); }
  while(curDate-date < millis)
  { 
  //print("Waiting "+millis+"ms...\r\n") 
  }
}

//*******************************************
// Declarations and Inititalizations
var nandwriter_dir    = java.lang.System.getProperty("user.dir");
var dss_script_dir    = java.lang.System.getenv("DSS_SCRIPT_DIR");
var host_os           = "";
var script_logs    = nandwriter_dir+"/logs/";
var script_configs = nandwriter_dir+"/configs/";
var script_binaries = nandwriter_dir+"/binaries/";
var targetConfig = "";
var writeAll = false;
var writerImages = "";
var big_endian = false;
var targetFlag = "unknown";
var targetConfig = "unknown";
var emul560 = false;
var xds200 = false;
var emulation_spec = "onboard XDS100";
testEnv.cioFile = null;

if (java.lang.System.getProperty("os.name").match(/Linux/i))
{
        host_os = "-linuxhost";
}

// Parse the arguments
if (arguments.length > 0 && arguments.length < 3)
{
    // parse the board spec
    var board_spec = arguments[0].toLowerCase();
    board_spec = board_spec.replace(/^tmd(x|s)/, "");
    board_spec = board_spec.replace(/^evmc/, "evm");
    
    // find endian, user wants
    if (board_spec.match(/-be$/))
    {
        big_endian = true;
        board_spec = board_spec.replace(/-be$/, "");
    }
    else
        board_spec = board_spec.replace(/-le$/, "");
        
    // find onboard emulation option for this board 
    if (board_spec.match(/lx?e$/))
    {
        emul560 = true;
	emulation_spec = "XDS560 mezzanine";
        board_spec = board_spec.replace(/e$/, "");
    }
      
    if (board_spec.match(/ls$/))
    {
        xds200 = true;
	emulation_spec = "XDS200 emulator";
        board_spec = board_spec.replace(/ls$/, "l");
    }

    if (board_spec.match(/k2h$/) || board_spec.match(/k2e$/) || board_spec.match(/k2l$/) || board_spec.match(/k2g$/))
    {
        emulation_spec = "XDS2xx emulator";
    }

	// for now, use the same software for lx and l variants
    board_spec = board_spec.replace(/lx$/, "l");

    // for now, treat evm6618l as an alias for evm6670l
    board_spec = board_spec.replace(/evm6618/, "evm6670");

    targetFlag = board_spec;

    endian_spec = (big_endian ? "-be" : "");

    board_binaries = script_binaries + targetFlag + endian_spec + "/";
    targetConfig = java.lang.System.getenv("PROGRAM_EVM_TARGET_CONFIG_FILE");
    if (!targetConfig)
        targetConfig = script_configs + targetFlag + "/" + targetFlag + (emul560 ? "e" : "") + (xds200 ? "s" : "") + host_os + ".ccxml";

    print("board: " + targetFlag);
    print("endian: " + (big_endian ? "Big" : "Little"));
    print("emulation: " + emulation_spec);
    print("binaries: " + board_binaries);
    print("ccxml: " + targetConfig);
    
    var dir = new File(board_binaries);
    if (!dir.exists())
    {
        print("board binaries directory not found");
        java.lang.System.exit(2);
    }
    
    if(arguments[1])
        writerImages = arguments[1];
    else
        writeAll = true;   
}
else
{
  print("Syntax error in command line");
	print("Syntax: program_evm.js [tmdx|tmds]evm[c](<device>)l[x][e][-le|-be] [images_to_write]")
  
	print("    tmdx: TMDX type EVM")
	print("    tmds: TMDS type EVM")
	print("    c: Not used, for backward compatibility")
	print("    <device> is the board name e.g 6472,6678 etc")
	print("    l: Low cost EVM")
	print("    x: EVM supports encryption")
	print("    e: EVM uses 560 Mezzanine Emulator daughter card")
	print("    le: Little Endian")
	print("    be: Big Endian")

	print("    example: TMDXEVM6678L-le")	
	print("    [images_to_write] OPTIONAL is a list of the images to be written")
	print("    example: eeprom50,nor")
	print("    If not specified all (eeprom50,eeprom51,nand,nor) will be written")
	java.lang.System.exit(0);
}

var i2cwriterbinary = board_binaries + "eepromwriter_" + targetFlag + ".out";
var nandwriterbinary = board_binaries + "nandwriter_" + targetFlag + ".out";
var norwriterbinary = board_binaries + "norwriter_" + targetFlag + ".out";
var eepromwriter_input51 = board_binaries + "eepromwriter_input51.txt";
var eepromwriter_input50 = board_binaries + "eepromwriter_input50.txt";
var eepromwriter_input = board_binaries + "eepromwriter_input.txt";
var eeprom50 = board_binaries + "eeprom50.bin";
var eeprom51 = board_binaries + "eeprom51.bin";
var nand = board_binaries + "nand.bin";
var nor = board_binaries + "nor.bin";

// Note: nAddress is the load address for using eepromwriter.
//       nandNorAddress is the address used for nandwriter and norwriter.
switch (targetFlag)
{
	case "evm6457l":
		cpu_id = "C64XP_1";
		var nAddress = 0x800000;
		var nandNorAddress = nAddress;
		var iblByteSwap = false;
		break;
	case "evm6474l":
		cpu_id = "C64XP_0";
		var nAddress = 0x800000;
		var nandNorAddress = nAddress;
		var iblByteSwap = false;
		break;
	case "evm6455":
		cpu_id = "C64XP_0";
		var nAddress = 0x800000;
		var nandNorAddress = nAddress;
		var iblByteSwap = false;
		break;
	case "evm6474":
		cpu_id = "C64XP_1A";
		var nAddress = 0x800000;
		var nandNorAddress = nAddress;
		var iblByteSwap = false;
		break;
	case "evm6472l":
		cpu_id = "C64XP_A";
		var nAddress = 0x800000;
		var nandNorAddress = nAddress;
		var iblByteSwap = false;
		break;
	case "evm6670l":
		cpu_id = "C66xx_0";
		var nAddress = 0x0C000000;
		var nandNorAddress = 0x80000000;
		var iblByteSwap = false;
		break;
	case "evm6678l":
		cpu_id = "C66xx_0";
		var nAddress = 0x0C000000;
		var nandNorAddress = 0x80000000;
		var iblByteSwap = false;
		break;
	case "evm6657l":
		cpu_id = "C66xx_0";
		var nAddress = 0x0C000000;
		var nandNorAddress = 0x80000000;
		var iblByteSwap = false;
		break;
	case "evmk2h":
		cpu_id = "C66xx_0";
		var nAddress = 0x0C000000;
		var nandNorAddress = 0x80000000;
		var iblByteSwap = false;
        break;
	case "evmk2e":
		cpu_id = "C66xx_0";
		var nAddress = 0x0C000000;
		var nandNorAddress = 0x80000000;
		var iblByteSwap = false;
        break;
	case "evmk2l":
		cpu_id = "C66xx_0";
		var nAddress = 0x0C000000;
		var nandNorAddress = 0x80000000;
		var iblByteSwap = false;
        break;
	case "evmk2g":
		cpu_id = "C66xx_0";
		var nAddress = 0x0C000000;
		var nandNorAddress = 0x80000000;
		var iblByteSwap = false;
        break;
	default:
		script.traceWrite("Could not file cpu id for target " + targetFlag + "\n");


}

start = localTime();
testEnv.cioFile = script_logs+targetFlag+"_"+start+"-cio"+".txt";
// Create a log file in the current directory to log script execution
script.traceBegin(script_logs+targetFlag+"_"+start+"-trace"+".txt")

// Configure target
debugServer.setConfig(targetConfig);
pausecomp(1000);
debugSession = debugServer.openSession("*",cpu_id);

if (testEnv.cioFile != null)
	debugSession.beginCIOLogging(testEnv.cioFile);
pausecomp(1000);
debugSession.target.connect();
pausecomp(1000);
debugSession.target.reset();
pausecomp(1000);

//POST
if(writeAll || writerImages.match(/eeprom50/))
{
	//Write EEPROM
	start = localTime();
	script.traceWrite("Start writing eeprom50");
	script.traceWrite("Writer:" + i2cwriterbinary + "\r\n");
	script.traceWrite("Image:" + eeprom50 + "\r\n");
	if (isFile(i2cwriterbinary) && isFile(eeprom50)) 
	{
		fileCopy(eepromwriter_input50,eepromwriter_input);
		debugSession.memory.loadProgram(i2cwriterbinary);
		var nPage = 0x0;
	//	var nAddress = 0x80000000;
		var sFilename = eeprom50 ;
		var nTypeSize = 32;
		var bByteSwap = false;
		try
		{
			debugSession.memory.loadRaw(nPage, nAddress, sFilename, nTypeSize, bByteSwap);
		}
		catch (ex)
		{
		   errCode = getErrorCode(ex);
		   script.traceWrite("Error code #" + errCode + ", could not load file " + sFilename +
					" to target memory!");
		}
		debugSession.target.run()
		end = localTime();
	}
	else
	{
		script.traceWrite("Required EEPROM50 files do not exist in " + board_binaries + "\n");
	 
	}
}

//IBL 
if(writeAll || writerImages.match(/eeprom51/))
{
	start = localTime();
	script.traceWrite("Start writing eeprom51");
	script.traceWrite("Writer:" + i2cwriterbinary + "\r\n");
	script.traceWrite("Image:" + eeprom51 + "\r\n");
	
	if (isFile(i2cwriterbinary) && isFile(eeprom51)) 
	{
		fileCopy(eepromwriter_input51,eepromwriter_input);
		debugSession.memory.loadProgram(i2cwriterbinary);
		var nPage = 0x0;
	//	var nAddress = 0x80000000;
		var sFilename = eeprom51;
		var nTypeSize = 32;
		var bByteSwap = iblByteSwap;
		try
		{
			debugSession.memory.loadRaw(nPage, nAddress, sFilename, nTypeSize, bByteSwap);
		}
		catch (ex)
		{
		   errCode = getErrorCode(ex);
		   script.traceWrite("Error code #" + errCode + ", could not load file " + sFilename +
					" to target memory!");
		}

		debugSession.target.run()
		end = localTime();
	}
	else
	{
		script.traceWrite("Required EEPROM51 files do not exist in " + board_binaries + "\n");
	 
	}
}


//NAND
if(writeAll || writerImages.match(/nand/))
{
    if (writerImages.match(/format/))
    {
       /* No action is taken for NAND since it is format*/
    }
	else
	{
    	start_nand = localTime();
    	script.traceWrite("Writer:" + nandwriterbinary + "\r\n");
    	script.traceWrite("NAND:" + nand + "\r\n");
    	if (isFile(nand) && isFile(nandwriterbinary)) 
    	{
    		debugSession.memory.loadProgram(nandwriterbinary);
    		var nPage = 0x0;
    	//	var nAddress = 0x80000000;
    		var sFilename = nand;
    		var nTypeSize = 32;
    		var bByteSwap = false;
    
    		try
    		{   
    			script.traceWrite("Start loading nand.bin");
    			debugSession.memory.loadRaw(nPage, nandNorAddress, sFilename, nTypeSize, bByteSwap);
    
    		}
    		catch (ex)
    		{
    		   errCode = getErrorCode(ex);
    		   script.traceWrite("Error code #" + errCode + ", could not load file " + sFilename +
    					" to target memory!");
    		}
    		script.traceWrite("Start programming NAND");
    		debugSession.target.run()
    		script.traceWrite("End programming NAND");
    		end_nand = localTime();
    	}
    	else
    	{
    		script.traceWrite("Required NAND files does not exist in " + board_binaries + "\n");
    	 
    	}
     }
}

//FORMAT the flash
if (writerImages.match(/format/))
{
//NAND Erase all
    if (writerImages.match(/nand/))
    {
    	start_nand = localTime();
    	script.traceWrite("Writer:" + nandwriterbinary + "\r\n");
    	if (isFile(nandwriterbinary)) 
    	{
    		debugSession.memory.loadProgram(nandwriterbinary);
    		var nPage = 0x0;
    		var nValue = 0x12345678;
    
    		try
    		{   
    			script.traceWrite("Formatting NAND device ... Initiated");
    			// Get the address of that symbol
    			var flag_address = debugSession.symbol.getAddress("nand_erase_flag")			
    			debugSession.memory.writeWord(nPage, flag_address, nValue);
    		}
    		catch (ex)
    		{
    		   errCode = getErrorCode(ex);
    		   script.traceWrite("Error code #" + errCode + ", could not set the nandwriter for erasing all nand blocks! ");
    		}
    		debugSession.target.run()
    		script.traceWrite("Formatting NAND device ...Completed");
			end_nand = localTime();
    	}
    	else
    	{
    		script.traceWrite("Required NAND binary does not exist in " + board_binaries + "\n");
    	 
    	}
    }
	else
	{ 
	  /* No action is taken */
	  script.traceWrite("FLASH FORMAT - No Action is taken, please provide the supported format command string, e.g., format-nand");
	}

    if (testEnv.cioFile != null)
    {
    	// Stop CIO logging.
    	debugSession.endCIOLogging();
    }
    
    debugSession.terminate();
    debugServer.stop()
    
    // Stop logging and exit.
    script.traceEnd();
    java.lang.System.exit(0);
	
}

//NOR
if(writeAll || writerImages.match(/nor/))
{
	start_nor = localTime();
	script.traceWrite("Writer:" + norwriterbinary + "\r\n");
	script.traceWrite("NOR:" + nor + "\r\n");

	
	if (isFile(nor) && isFile(norwriterbinary)) 
	{
	
		debugSession.memory.loadProgram(norwriterbinary);
		var nPage = 0x0;
	//	var nAddress = 0x80000000;
		var sFilename = nor ;
		var nTypeSize = 32;
		var bByteSwap = false;
		try
		{   
			script.traceWrite("Start loading nor.bin");
			debugSession.memory.loadRaw(nPage, nandNorAddress, sFilename, nTypeSize, bByteSwap);

		}
		catch (ex)
		{
		   errCode = getErrorCode(ex);
		   script.traceWrite("Error code #" + errCode + ", could not load file " + sFilename +
					" to target memory!");
		}
		script.traceWrite("Start programming NOR");
		script.traceWrite(localTime());
		debugSession.target.run()
		script.traceWrite("End programming NOR");
		end_nor = localTime();
    }
	else
	{
		script.traceWrite("Required NOR files does not exist in " + board_binaries + "\n");
	 
	}

}

if (testEnv.cioFile != null)
{
	// Stop CIO logging.
	debugSession.endCIOLogging();
}

debugSession.terminate();
debugServer.stop()

// Stop logging and exit.
script.traceEnd();
java.lang.System.exit(0);
