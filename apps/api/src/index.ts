import { defineAbilityFor } from '@saas/auth'

const ability = defineAbilityFor({ role: 'MEMBER' })

const userCanInviteSemeoneElse = ability.can('invite', 'User')
const userCanDeleteOtherUsers = ability.can('delete', 'User')

const userCannotDeleteOtherUsers = ability.cannot('delete', 'User')

console.log(userCanInviteSemeoneElse)
console.log(userCanDeleteOtherUsers)
console.log(userCannotDeleteOtherUsers)
