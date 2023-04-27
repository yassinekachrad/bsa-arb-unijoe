export const LBPairV21ABI = [
    {
      inputs: [
        {
          internalType: 'contract ILBFactory',
          name: 'factory_',
          type: 'address'
        }
      ],
      stateMutability: 'nonpayable',
      type: 'constructor'
    },
    { inputs: [], name: 'AddressHelper__CallFailed', type: 'error' },
    { inputs: [], name: 'AddressHelper__NonContract', type: 'error' },
    {
      inputs: [{ internalType: 'uint24', name: 'id', type: 'uint24' }],
      name: 'BinHelper__CompositionFactorFlawed',
      type: 'error'
    },
    { inputs: [], name: 'BinHelper__LiquidityOverflow', type: 'error' },
    { inputs: [], name: 'FeeHelper__FeeOverflow', type: 'error' },
    { inputs: [], name: 'LBPair__AddressZero', type: 'error' },
    { inputs: [], name: 'LBPair__AlreadyInitialized', type: 'error' },
    { inputs: [], name: 'LBPair__EmptyMarketConfigs', type: 'error' },
    { inputs: [], name: 'LBPair__FlashLoanCallbackFailed', type: 'error' },
    {
      inputs: [],
      name: 'LBPair__FlashLoanInsufficientAmount',
      type: 'error'
    },
    { inputs: [], name: 'LBPair__InsufficientAmountIn', type: 'error' },
    { inputs: [], name: 'LBPair__InsufficientAmountOut', type: 'error' },
    { inputs: [], name: 'LBPair__InvalidInput', type: 'error' },
    {
      inputs: [],
      name: 'LBPair__InvalidStaticFeeParameters',
      type: 'error'
    },
    { inputs: [], name: 'LBPair__MaxTotalFeeExceeded', type: 'error' },
    { inputs: [], name: 'LBPair__OnlyFactory', type: 'error' },
    { inputs: [], name: 'LBPair__OnlyProtocolFeeRecipient', type: 'error' },
    { inputs: [], name: 'LBPair__OutOfLiquidity', type: 'error' },
    { inputs: [], name: 'LBPair__TokenNotSupported', type: 'error' },
    {
      inputs: [{ internalType: 'uint24', name: 'id', type: 'uint24' }],
      name: 'LBPair__ZeroAmount',
      type: 'error'
    },
    {
      inputs: [{ internalType: 'uint24', name: 'id', type: 'uint24' }],
      name: 'LBPair__ZeroAmountsOut',
      type: 'error'
    },
    { inputs: [], name: 'LBPair__ZeroBorrowAmount', type: 'error' },
    {
      inputs: [{ internalType: 'uint24', name: 'id', type: 'uint24' }],
      name: 'LBPair__ZeroShares',
      type: 'error'
    },
    { inputs: [], name: 'LBToken__AddressThisOrZero', type: 'error' },
    {
      inputs: [
        { internalType: 'address', name: 'from', type: 'address' },
        { internalType: 'uint256', name: 'id', type: 'uint256' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' }
      ],
      name: 'LBToken__BurnExceedsBalance',
      type: 'error'
    },
    { inputs: [], name: 'LBToken__InvalidLength', type: 'error' },
    {
      inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
      name: 'LBToken__SelfApproval',
      type: 'error'
    },
    {
      inputs: [
        { internalType: 'address', name: 'from', type: 'address' },
        { internalType: 'address', name: 'spender', type: 'address' }
      ],
      name: 'LBToken__SpenderNotApproved',
      type: 'error'
    },
    {
      inputs: [
        { internalType: 'address', name: 'from', type: 'address' },
        { internalType: 'uint256', name: 'id', type: 'uint256' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' }
      ],
      name: 'LBToken__TransferExceedsBalance',
      type: 'error'
    },
    {
      inputs: [],
      name: 'LiquidityConfigurations__InvalidConfig',
      type: 'error'
    },
    { inputs: [], name: 'OracleHelper__InvalidOracleId', type: 'error' },
    {
      inputs: [],
      name: 'OracleHelper__LookUpTimestampTooOld',
      type: 'error'
    },
    { inputs: [], name: 'OracleHelper__NewLengthTooSmall', type: 'error' },
    { inputs: [], name: 'PackedUint128Math__AddOverflow', type: 'error' },
    {
      inputs: [],
      name: 'PackedUint128Math__MultiplierTooLarge',
      type: 'error'
    },
    { inputs: [], name: 'PackedUint128Math__SubUnderflow', type: 'error' },
    {
      inputs: [],
      name: 'PairParametersHelper__InvalidParameter',
      type: 'error'
    },
    { inputs: [], name: 'ReentrancyGuard__ReentrantCall', type: 'error' },
    { inputs: [], name: 'SafeCast__Exceeds128Bits', type: 'error' },
    { inputs: [], name: 'SafeCast__Exceeds24Bits', type: 'error' },
    { inputs: [], name: 'SafeCast__Exceeds40Bits', type: 'error' },
    { inputs: [], name: 'TokenHelper__TransferFailed', type: 'error' },
    { inputs: [], name: 'Uint128x128Math__LogUnderflow', type: 'error' },
    {
      inputs: [
        { internalType: 'uint256', name: 'x', type: 'uint256' },
        { internalType: 'int256', name: 'y', type: 'int256' }
      ],
      name: 'Uint128x128Math__PowUnderflow',
      type: 'error'
    },
    { inputs: [], name: 'Uint256x256Math__MulDivOverflow', type: 'error' },
    {
      inputs: [],
      name: 'Uint256x256Math__MulShiftOverflow',
      type: 'error'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'account',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'bool',
          name: 'approved',
          type: 'bool'
        }
      ],
      name: 'ApprovalForAll',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'feeRecipient',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'bytes32',
          name: 'protocolFees',
          type: 'bytes32'
        }
      ],
      name: 'CollectedProtocolFees',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint24',
          name: 'id',
          type: 'uint24'
        },
        {
          indexed: false,
          internalType: 'bytes32',
          name: 'totalFees',
          type: 'bytes32'
        },
        {
          indexed: false,
          internalType: 'bytes32',
          name: 'protocolFees',
          type: 'bytes32'
        }
      ],
      name: 'CompositionFees',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256[]',
          name: 'ids',
          type: 'uint256[]'
        },
        {
          indexed: false,
          internalType: 'bytes32[]',
          name: 'amounts',
          type: 'bytes32[]'
        }
      ],
      name: 'DepositedToBins',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'contract ILBFlashLoanCallback',
          name: 'receiver',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint24',
          name: 'activeId',
          type: 'uint24'
        },
        {
          indexed: false,
          internalType: 'bytes32',
          name: 'amounts',
          type: 'bytes32'
        },
        {
          indexed: false,
          internalType: 'bytes32',
          name: 'totalFees',
          type: 'bytes32'
        },
        {
          indexed: false,
          internalType: 'bytes32',
          name: 'protocolFees',
          type: 'bytes32'
        }
      ],
      name: 'FlashLoan',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint24',
          name: 'idReference',
          type: 'uint24'
        },
        {
          indexed: false,
          internalType: 'uint24',
          name: 'volatilityReference',
          type: 'uint24'
        }
      ],
      name: 'ForcedDecay',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint16',
          name: 'oracleLength',
          type: 'uint16'
        }
      ],
      name: 'OracleLengthIncreased',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint16',
          name: 'baseFactor',
          type: 'uint16'
        },
        {
          indexed: false,
          internalType: 'uint16',
          name: 'filterPeriod',
          type: 'uint16'
        },
        {
          indexed: false,
          internalType: 'uint16',
          name: 'decayPeriod',
          type: 'uint16'
        },
        {
          indexed: false,
          internalType: 'uint16',
          name: 'reductionFactor',
          type: 'uint16'
        },
        {
          indexed: false,
          internalType: 'uint24',
          name: 'variableFeeControl',
          type: 'uint24'
        },
        {
          indexed: false,
          internalType: 'uint16',
          name: 'protocolShare',
          type: 'uint16'
        },
        {
          indexed: false,
          internalType: 'uint24',
          name: 'maxVolatilityAccumulator',
          type: 'uint24'
        }
      ],
      name: 'StaticFeeParametersSet',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint24',
          name: 'id',
          type: 'uint24'
        },
        {
          indexed: false,
          internalType: 'bytes32',
          name: 'amountsIn',
          type: 'bytes32'
        },
        {
          indexed: false,
          internalType: 'bytes32',
          name: 'amountsOut',
          type: 'bytes32'
        },
        {
          indexed: false,
          internalType: 'uint24',
          name: 'volatilityAccumulator',
          type: 'uint24'
        },
        {
          indexed: false,
          internalType: 'bytes32',
          name: 'totalFees',
          type: 'bytes32'
        },
        {
          indexed: false,
          internalType: 'bytes32',
          name: 'protocolFees',
          type: 'bytes32'
        }
      ],
      name: 'Swap',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256[]',
          name: 'ids',
          type: 'uint256[]'
        },
        {
          indexed: false,
          internalType: 'uint256[]',
          name: 'amounts',
          type: 'uint256[]'
        }
      ],
      name: 'TransferBatch',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256[]',
          name: 'ids',
          type: 'uint256[]'
        },
        {
          indexed: false,
          internalType: 'bytes32[]',
          name: 'amounts',
          type: 'bytes32[]'
        }
      ],
      name: 'WithdrawnFromBins',
      type: 'event'
    },
    {
      inputs: [
        { internalType: 'address', name: 'spender', type: 'address' },
        { internalType: 'bool', name: 'approved', type: 'bool' }
      ],
      name: 'approveForAll',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'account', type: 'address' },
        { internalType: 'uint256', name: 'id', type: 'uint256' }
      ],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address[]', name: 'accounts', type: 'address[]' },
        { internalType: 'uint256[]', name: 'ids', type: 'uint256[]' }
      ],
      name: 'balanceOfBatch',
      outputs: [
        {
          internalType: 'uint256[]',
          name: 'batchBalances',
          type: 'uint256[]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'from', type: 'address' },
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint256[]', name: 'ids', type: 'uint256[]' },
        { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }
      ],
      name: 'batchTransferFrom',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'from', type: 'address' },
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint256[]', name: 'ids', type: 'uint256[]' },
        {
          internalType: 'uint256[]',
          name: 'amountsToBurn',
          type: 'uint256[]'
        }
      ],
      name: 'burn',
      outputs: [
        { internalType: 'bytes32[]', name: 'amounts', type: 'bytes32[]' }
      ],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'collectProtocolFees',
      outputs: [
        {
          internalType: 'bytes32',
          name: 'collectedProtocolFees',
          type: 'bytes32'
        }
      ],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'contract ILBFlashLoanCallback',
          name: 'receiver',
          type: 'address'
        },
        { internalType: 'bytes32', name: 'amounts', type: 'bytes32' },
        { internalType: 'bytes', name: 'data', type: 'bytes' }
      ],
      name: 'flashLoan',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'forceDecay',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getActiveId',
      outputs: [{ internalType: 'uint24', name: 'activeId', type: 'uint24' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint24', name: 'id', type: 'uint24' }],
      name: 'getBin',
      outputs: [
        { internalType: 'uint128', name: 'binReserveX', type: 'uint128' },
        { internalType: 'uint128', name: 'binReserveY', type: 'uint128' }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getBinStep',
      outputs: [{ internalType: 'uint16', name: '', type: 'uint16' }],
      stateMutability: 'pure',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getFactory',
      outputs: [
        {
          internalType: 'contract ILBFactory',
          name: 'factory',
          type: 'address'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint256', name: 'price', type: 'uint256' }],
      name: 'getIdFromPrice',
      outputs: [{ internalType: 'uint24', name: 'id', type: 'uint24' }],
      stateMutability: 'pure',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'bool', name: 'swapForY', type: 'bool' },
        { internalType: 'uint24', name: 'id', type: 'uint24' }
      ],
      name: 'getNextNonEmptyBin',
      outputs: [{ internalType: 'uint24', name: 'nextId', type: 'uint24' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getOracleParameters',
      outputs: [
        { internalType: 'uint8', name: 'sampleLifetime', type: 'uint8' },
        { internalType: 'uint16', name: 'size', type: 'uint16' },
        { internalType: 'uint16', name: 'activeSize', type: 'uint16' },
        { internalType: 'uint40', name: 'lastUpdated', type: 'uint40' },
        { internalType: 'uint40', name: 'firstTimestamp', type: 'uint40' }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint40', name: 'lookupTimestamp', type: 'uint40' }
      ],
      name: 'getOracleSampleAt',
      outputs: [
        { internalType: 'uint64', name: 'cumulativeId', type: 'uint64' },
        {
          internalType: 'uint64',
          name: 'cumulativeVolatility',
          type: 'uint64'
        },
        {
          internalType: 'uint64',
          name: 'cumulativeBinCrossed',
          type: 'uint64'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint24', name: 'id', type: 'uint24' }],
      name: 'getPriceFromId',
      outputs: [{ internalType: 'uint256', name: 'price', type: 'uint256' }],
      stateMutability: 'pure',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getProtocolFees',
      outputs: [
        { internalType: 'uint128', name: 'protocolFeeX', type: 'uint128' },
        { internalType: 'uint128', name: 'protocolFeeY', type: 'uint128' }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getReserves',
      outputs: [
        { internalType: 'uint128', name: 'reserveX', type: 'uint128' },
        { internalType: 'uint128', name: 'reserveY', type: 'uint128' }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getStaticFeeParameters',
      outputs: [
        { internalType: 'uint16', name: 'baseFactor', type: 'uint16' },
        { internalType: 'uint16', name: 'filterPeriod', type: 'uint16' },
        { internalType: 'uint16', name: 'decayPeriod', type: 'uint16' },
        { internalType: 'uint16', name: 'reductionFactor', type: 'uint16' },
        {
          internalType: 'uint24',
          name: 'variableFeeControl',
          type: 'uint24'
        },
        { internalType: 'uint16', name: 'protocolShare', type: 'uint16' },
        {
          internalType: 'uint24',
          name: 'maxVolatilityAccumulator',
          type: 'uint24'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint128', name: 'amountOut', type: 'uint128' },
        { internalType: 'bool', name: 'swapForY', type: 'bool' }
      ],
      name: 'getSwapIn',
      outputs: [
        { internalType: 'uint128', name: 'amountIn', type: 'uint128' },
        { internalType: 'uint128', name: 'amountOutLeft', type: 'uint128' },
        { internalType: 'uint128', name: 'fee', type: 'uint128' }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint128', name: 'amountIn', type: 'uint128' },
        { internalType: 'bool', name: 'swapForY', type: 'bool' }
      ],
      name: 'getSwapOut',
      outputs: [
        { internalType: 'uint128', name: 'amountInLeft', type: 'uint128' },
        { internalType: 'uint128', name: 'amountOut', type: 'uint128' },
        { internalType: 'uint128', name: 'fee', type: 'uint128' }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getTokenX',
      outputs: [
        { internalType: 'contract IERC20', name: 'tokenX', type: 'address' }
      ],
      stateMutability: 'pure',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getTokenY',
      outputs: [
        { internalType: 'contract IERC20', name: 'tokenY', type: 'address' }
      ],
      stateMutability: 'pure',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getVariableFeeParameters',
      outputs: [
        {
          internalType: 'uint24',
          name: 'volatilityAccumulator',
          type: 'uint24'
        },
        {
          internalType: 'uint24',
          name: 'volatilityReference',
          type: 'uint24'
        },
        { internalType: 'uint24', name: 'idReference', type: 'uint24' },
        { internalType: 'uint40', name: 'timeOfLastUpdate', type: 'uint40' }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint16', name: 'newLength', type: 'uint16' }],
      name: 'increaseOracleLength',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint16', name: 'baseFactor', type: 'uint16' },
        { internalType: 'uint16', name: 'filterPeriod', type: 'uint16' },
        { internalType: 'uint16', name: 'decayPeriod', type: 'uint16' },
        { internalType: 'uint16', name: 'reductionFactor', type: 'uint16' },
        {
          internalType: 'uint24',
          name: 'variableFeeControl',
          type: 'uint24'
        },
        { internalType: 'uint16', name: 'protocolShare', type: 'uint16' },
        {
          internalType: 'uint24',
          name: 'maxVolatilityAccumulator',
          type: 'uint24'
        },
        { internalType: 'uint24', name: 'activeId', type: 'uint24' }
      ],
      name: 'initialize',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'owner', type: 'address' },
        { internalType: 'address', name: 'spender', type: 'address' }
      ],
      name: 'isApprovedForAll',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'to', type: 'address' },
        {
          internalType: 'bytes32[]',
          name: 'liquidityConfigs',
          type: 'bytes32[]'
        },
        { internalType: 'address', name: 'refundTo', type: 'address' }
      ],
      name: 'mint',
      outputs: [
        {
          internalType: 'bytes32',
          name: 'amountsReceived',
          type: 'bytes32'
        },
        { internalType: 'bytes32', name: 'amountsLeft', type: 'bytes32' },
        {
          internalType: 'uint256[]',
          name: 'liquidityMinted',
          type: 'uint256[]'
        }
      ],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'name',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint16', name: 'baseFactor', type: 'uint16' },
        { internalType: 'uint16', name: 'filterPeriod', type: 'uint16' },
        { internalType: 'uint16', name: 'decayPeriod', type: 'uint16' },
        { internalType: 'uint16', name: 'reductionFactor', type: 'uint16' },
        {
          internalType: 'uint24',
          name: 'variableFeeControl',
          type: 'uint24'
        },
        { internalType: 'uint16', name: 'protocolShare', type: 'uint16' },
        {
          internalType: 'uint24',
          name: 'maxVolatilityAccumulator',
          type: 'uint24'
        }
      ],
      name: 'setStaticFeeParameters',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'bool', name: 'swapForY', type: 'bool' },
        { internalType: 'address', name: 'to', type: 'address' }
      ],
      name: 'swap',
      outputs: [{ internalType: 'bytes32', name: 'amountsOut', type: 'bytes32' }],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
      name: 'totalSupply',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }
  ] as const