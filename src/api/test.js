"use strict";

const mongoose = require('mongoose')
const UserTest = mongoose.model('UserTest')

module.exports = app => {
  const {
    existOrError,
  } = app.src.api.validation

  const viewUsers = async (req, res) => {
    const users = await UserTest.find().lean()

    return res.status(200).json(users)
  }

  const addUser = async (req, res) => {
    const { name, age, phone, address } = req.body;

    try {
      existOrError(name, 'Digite o nome do usuário')
      existOrError(age, 'Digite a idade do usuário')
      existOrError(phone, 'Digite o telefone do usuário')
      existOrError(address, 'Digite o endereço do usuário')
    } catch (msg) {
      return res.status(400).json({ msg })
    }

    await UserTest.create({ name, age, phone, address })

    return res.status(200).json({ msg: 'Usuário criado com sucesso' })
  }

  const viewUser = async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ msg: 'Digite o ID do usuário' })

    const user = await UserTest.findOne({ _id: id }).lean()

    if (!user) return res.status(404).json({ msg: 'Usuário não encontrado' })

    return res.status(200).json(user)
  }

  const changeUser = async (req, res) => {
    const { id } = req.params;
    const { name, age, phone, address } = req.body;

    if (!id) return res.status(400).json({ msg: 'Digite o ID do usuário' })

    try {
      existOrError(name, 'Digite o nome do usuário')
      existOrError(age, 'Digite a idade do usuário')
      existOrError(phone, 'Digite o telefone do usuário')
      existOrError(address, 'Digite o endereço do usuário')
    } catch (msg) {
      return res.status(400).json({ msg })
    }

    await UserTest.findOneAndUpdate({ _id: id }, { name, age, phone, address })

    return res.status(200).json({ msg: 'Usuário alterado com sucesso' })
  }

  const removeUser = async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ msg: 'Digite o ID do usuário' })

    await UserTest.findOneAndRemove({ _id: id })

    return res.status(200).end()
  }

  return {
    viewUsers,
    addUser,
    viewUser,
    changeUser,
    removeUser
  }
}