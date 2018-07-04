const Contract = require('truffle-contract')
const GnosisSafe = require('./contracts/GnosisSafe.json')
const Proxy = require('./contracts/Proxy.json')
const type = 'Gnosis Safe Keyring'

class GnosisSafeKeyring {

  constructor (opts) {
    this.type = type
    this.deserialize(opts)
  }

  serialize () {
    return Promise.resolve(this.wallets.map(w => w.getPrivateKey().toString('hex')))
  }

  deserialize ({ provider, owner, ownerAddress, safeAddress, threshold }) {
    this.GnosisSafeContract = Contract(GnosisSafe)
    this.GnosisSafeContract.setProvider(provider)
    this.safe = this.GnosisSafeContract.at(safeAddress)
    this.threshold = threshold
    this.owner = owner
    this.ownerAddress = ownerAddress
  }

  addAccounts (n = 1) {
    var newWallets = []
    for (var i = 0; i < n; i++) {
      newWallets.push(Wallet.generate())
    }
    this.wallets = this.wallets.concat(newWallets)
    const hexWallets = newWallets.map(w => ethUtil.bufferToHex(w.getAddress()))
    return Promise.resolve(hexWallets)
  }

  getAccounts () {
    return Promise.resolve(this.wallets.map(w => ethUtil.bufferToHex(w.getAddress())))
  }

  // tx is an instance of the ethereumjs-transaction class.
  signTransaction (address, tx) {
    if (address !== this.safe.address) {
      throw new Error('GnosisSafeKeyring can only send from its own address')
    }

    console.dir(tx)
    console.dir({
      nonce: tx.nonce,
      value: tx.value,
    })



    return this.owner.signTransaction(this.ownerAddress, tx)
    var privKey = wallet.getPrivateKey()
    tx.sign(privKey)
    return Promise.resolve(tx)
  }

  // For eth_sign, we need to sign arbitrary data:
  signMessage (withAccount, data) {
    const wallet = this._getWalletForAccount(withAccount)
    const message = ethUtil.stripHexPrefix(data)
    var privKey = wallet.getPrivateKey()
    var msgSig = ethUtil.ecsign(new Buffer(message, 'hex'), privKey)
    var rawMsgSig = ethUtil.bufferToHex(sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s))
    return Promise.resolve(rawMsgSig)
  }

  // For personal_sign, we need to prefix the message:
  signPersonalMessage (withAccount, msgHex) {
    const wallet = this._getWalletForAccount(withAccount)
    const privKey = ethUtil.stripHexPrefix(wallet.getPrivateKey())
    const privKeyBuffer = new Buffer(privKey, 'hex')
    const sig = sigUtil.personalSign(privKeyBuffer, { data: msgHex })
    return Promise.resolve(sig)
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData (withAccount, typedData) {
    const wallet = this._getWalletForAccount(withAccount)
    const privKey = ethUtil.toBuffer(wallet.getPrivateKey())
    const sig = sigUtil.signTypedData(privKey, { data: typedData })
    return Promise.resolve(sig)
  }

  // exportAccount should return a hex-encoded private key:
  exportAccount (address) {
    const wallet = this._getWalletForAccount(address)
    return Promise.resolve(wallet.getPrivateKey().toString('hex'))
  }

}

GnosisSafeKeyring.type = type
module.exports = GnosisSafeKeyring

