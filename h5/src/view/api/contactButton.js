import pubsub from './bridge'


function insertContactButton(e) {
  pubsub.invokeMethod("insertContactButton", e)
}

function updateContactButton(e) {
  pubsub.invokeMethod("updateContactButton", e)
}

function removeContactButton(e) {
  pubsub.invokeMethod("removeContactButton", e)
}

function enterContact(e) {
  pubsub.invokeMethod("enterContact", e)
}

export default  {
  insertContactButton,
  updateContactButton,
  removeContactButton,
  enterContact
}

