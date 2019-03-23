#!/bin/bash

export DSS_SCRIPT_DIR=/home/user1/ti/ccsv8/ccs_base/scripting/bin
export PROGRAM_EVM_TARGET_CONFIG_FILE=configs/evmk2h/evmk2h-linuxhost.ccxml

$DSS_SCRIPT_DIR/dss.sh program_evm.js evmk2h nor

